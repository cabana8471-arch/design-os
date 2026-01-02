#!/bin/bash
# sync.sh - Design OS Boilerplate Sync Script
# Synchronizes boilerplate files to target projects with backup, diff, and conflict resolution

# Note: Not using 'set -e' as it causes issues with some subcommands returning non-zero
# Instead, we handle errors explicitly in critical sections

# ============================================================================
# INITIALIZATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/sync-config.sh"

# Exit codes
EXIT_SUCCESS=0
EXIT_GENERAL_ERROR=1
EXIT_TARGET_NOT_FOUND=2
EXIT_INVALID_TARGET=3
EXIT_LOCK_EXISTS=4
EXIT_BACKUP_ERROR=5
EXIT_COPY_ERROR=6
EXIT_MISSING_DEPENDENCY=7
EXIT_BATCH_PARTIAL_FAIL=10
# Create mode exit codes
EXIT_CREATE_CANCELLED=11
EXIT_CREATE_COPY_ERROR=12
EXIT_CREATE_NPM_ERROR=13
EXIT_CREATE_GIT_ERROR=14

# ============================================================================
# DEFAULT OPTIONS
# ============================================================================

TARGET_PATH=""
BATCH_MODE=false
DRY_RUN=false
BACKUP_ENABLED=true
SHOW_DIFF=false
RESTORE_MODE=false
RESTORE_ID=""
LIST_BACKUPS_MODE=false
STATUS_MODE=false
FORCE_MODE=false
SKIP_ALL_CONFLICTS=false
CLEANUP_MODE=false
VERBOSE=false
QUIET=false

# Create mode options
CREATE_MODE=false
CREATE_PATH=""
PROJECT_NAME=""
NO_INSTALL=false
NO_GIT=false

# Runtime state
LOCK_FILE=""
FILES_NEW=()
FILES_MODIFIED=()
FILES_UNCHANGED=()
FILES_CONFLICTS=()
FILES_ERRORS=()
CURRENT_BACKUP_DIR=""
START_TIME=""
MANIFEST_DATA=""

# File metadata storage (populated during analyze_files)
# Using parallel arrays for Bash 3.2 compatibility
# Each entry: "path|source_size|source_lines|target_size|target_lines"
FILE_META_NEW=()       # New files: "path|size|lines"
FILE_META_MODIFIED=()  # Modified files: "path|src_size|src_lines|tgt_size|tgt_lines"
FILE_META_UNCHANGED=() # Unchanged files: "path"
FILE_META_CONFLICT=()  # Conflicts: "path|src_size|tgt_size"

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

log_info() {
  [[ "$QUIET" == true ]] && return
  echo "[INFO] $1"
}

log_warn() {
  echo "[WARN] $1" >&2
}

log_error() {
  echo "[ERROR] $1" >&2
}

log_success() {
  [[ "$QUIET" == true ]] && return
  echo "[✓] $1"
}

log_verbose() {
  [[ "$VERBOSE" == true ]] && echo "[DEBUG] $1"
}

# ============================================================================
# HELP
# ============================================================================

show_help() {
  cat << 'EOF'
Design OS Boilerplate Sync Script

USAGE:
  ./scripts/sync.sh --target <path> [options]
  ./scripts/sync.sh --batch [options]
  ./scripts/sync.sh --create <path> [options]

REQUIRED (for sync/restore/status):
  --target <path>       Path to target project

CREATE MODE:
  --create <path>       Create a new Design OS project at <path>
  --name <name>         Project name (default: folder name)
  --no-install          Skip npm install
  --no-git              Skip git init

SYNC OPTIONS:
  --batch               Sync to all projects in targets.txt
  --dry-run             Simulate sync without making changes
  --backup              Create backup before sync (default: on)
  --no-backup           Disable backup
  --diff                Show file differences
  --restore <id>        Restore from backup (requires --target)
  --list-backups        List available backups (requires --target)
  --status              Check if target is up-to-date (no sync)
  --force               Overwrite all conflicts without prompting
  --skip-conflicts      Skip conflicting files without overwriting
  --cleanup             Only cleanup old logs/backups, no sync
  --verbose             Detailed output
  --quiet               Only show errors
  --help                Show this help

EXAMPLES:
  # Create a new project
  ./scripts/sync.sh --create ~/projects/my-app

  # Create with custom name
  ./scripts/sync.sh --create ~/projects/my-app --name "My SaaS App"

  # Create without npm install (for CI/CD)
  ./scripts/sync.sh --create ~/projects/my-app --no-install

  # Create without git init
  ./scripts/sync.sh --create ~/projects/my-app --no-git

  # Preview changes (dry-run)
  ./scripts/sync.sh --target ~/projects/my-app --dry-run

  # Sync with diff preview
  ./scripts/sync.sh --target ~/projects/my-app --diff

  # Check status
  ./scripts/sync.sh --target ~/projects/my-app --status

  # Sync all projects
  ./scripts/sync.sh --batch

  # Force sync (no prompts)
  ./scripts/sync.sh --target ~/projects/my-app --force

  # List and restore backups
  ./scripts/sync.sh --target ~/projects/my-app --list-backups
  ./scripts/sync.sh --target ~/projects/my-app --restore 2025-12-26-14-30-00

EXIT CODES:
  0   Success
  1   General error / invalid arguments
  2   Target not found
  3   Target is not a valid Design OS project
  4   Lock file exists (another sync in progress)
  5   Backup error
  6   Copy error
  7   Missing dependency
  10  Batch mode - at least one project failed
  11  Create cancelled by user
  12  Create copy error
  13  npm install failed (warning only)
  14  git init failed (warning only)
EOF
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --target)
        TARGET_PATH="$2"
        shift 2
        ;;
      --create)
        CREATE_MODE=true
        CREATE_PATH="$2"
        shift 2
        ;;
      --name)
        PROJECT_NAME="$2"
        shift 2
        ;;
      --no-install)
        NO_INSTALL=true
        shift
        ;;
      --no-git)
        NO_GIT=true
        shift
        ;;
      --batch)
        BATCH_MODE=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --backup)
        BACKUP_ENABLED=true
        shift
        ;;
      --no-backup)
        BACKUP_ENABLED=false
        shift
        ;;
      --diff)
        SHOW_DIFF=true
        shift
        ;;
      --restore)
        RESTORE_MODE=true
        RESTORE_ID="$2"
        shift 2
        ;;
      --list-backups)
        LIST_BACKUPS_MODE=true
        shift
        ;;
      --status)
        STATUS_MODE=true
        shift
        ;;
      --force)
        FORCE_MODE=true
        shift
        ;;
      --skip-conflicts)
        SKIP_ALL_CONFLICTS=true
        shift
        ;;
      --cleanup)
        CLEANUP_MODE=true
        shift
        ;;
      --verbose)
        VERBOSE=true
        shift
        ;;
      --quiet)
        QUIET=true
        shift
        ;;
      --help|-h)
        show_help
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit $EXIT_GENERAL_ERROR
        ;;
    esac
  done
}

# ============================================================================
# VALIDATION
# ============================================================================

validate_environment() {
  # Check bash version
  if [[ "${BASH_VERSINFO[0]}" -lt 3 ]]; then
    log_error "Bash 3.2+ required (found ${BASH_VERSION})"
    exit $EXIT_MISSING_DEPENDENCY
  fi

  # Check required commands
  if ! command -v diff &>/dev/null; then
    log_error "diff command not found"
    exit $EXIT_MISSING_DEPENDENCY
  fi

  # Check if jq is available (optional)
  if command -v jq &>/dev/null; then
    log_verbose "jq is available for JSON formatting"
  else
    log_verbose "jq not found, using manual JSON generation"
  fi

  # Ensure logs directory exists
  mkdir -p "$LOGS_DIR"
  mkdir -p "$BACKUPS_DIR"
}

validate_target() {
  local target="$1"

  # Expand ~ to home directory
  target="${target/#\~/$HOME}"

  # Check if target exists
  if [[ ! -d "$target" ]]; then
    log_error "Target directory does not exist: $target"
    exit $EXIT_TARGET_NOT_FOUND
  fi

  # Check if it's a valid Design OS project
  if [[ ! -d "$target/.claude" ]] && [[ ! -f "$target/package.json" ]]; then
    log_error "Target is not a valid Design OS project: $target"
    log_error "Expected .claude/ directory or package.json"
    exit $EXIT_INVALID_TARGET
  fi

  # Return expanded path
  echo "$target"
}

# ============================================================================
# LOCK FILE MANAGEMENT
# ============================================================================

acquire_lock() {
  local target="$1"
  LOCK_FILE="$target/.sync.lock"

  if [[ -f "$LOCK_FILE" ]]; then
    local pid
    pid=$(cat "$LOCK_FILE" 2>/dev/null)
    if ps -p "$pid" &>/dev/null 2>&1; then
      log_error "Another sync is in progress (PID: $pid)"
      log_error "Lock file: $LOCK_FILE"
      exit $EXIT_LOCK_EXISTS
    fi
    # Stale lock file, remove it
    log_warn "Removing stale lock file (PID $pid not running)"
    rm -f "$LOCK_FILE"
  fi

  echo $$ > "$LOCK_FILE"
  trap 'release_lock' EXIT INT TERM
  log_verbose "Lock acquired: $LOCK_FILE"
}

release_lock() {
  if [[ -n "$LOCK_FILE" ]] && [[ -f "$LOCK_FILE" ]]; then
    rm -f "$LOCK_FILE"
    log_verbose "Lock released: $LOCK_FILE"
  fi
}

# ============================================================================
# MANIFEST MANAGEMENT
# ============================================================================

load_manifest() {
  local target="$1"
  local manifest_file="$target/.sync-manifest.json"

  if [[ -f "$manifest_file" ]]; then
    MANIFEST_DATA=$(cat "$manifest_file")
    log_verbose "Loaded manifest from $manifest_file"
  else
    MANIFEST_DATA=""
    log_info "First sync detected. Will create manifest."
  fi
}

save_manifest() {
  local target="$1"
  local manifest_file="$target/.sync-manifest.json"
  local version
  version=$(get_boilerplate_version)
  local timestamp
  timestamp=$(get_timestamp)

  # Build files JSON
  local files_json="{"
  local first=true

  for file in "${FILES_NEW[@]}" "${FILES_MODIFIED[@]}" "${FILES_UNCHANGED[@]}"; do
    local target_file="$target/$file"
    if [[ -f "$target_file" ]]; then
      local hash
      hash=$(get_file_hash "$target_file")
      local size
      size=$(get_file_size "$target_file")

      if [[ "$first" == true ]]; then
        first=false
      else
        files_json+=","
      fi

      files_json+="
    \"$file\": {
      \"synced_hash\": \"$hash\",
      \"synced_at\": \"$timestamp\",
      \"source_size\": $size
    }"
    fi
  done

  files_json+="
  }"

  cat > "$manifest_file" << EOF
{
  "last_sync": "$timestamp",
  "boilerplate_version": "$version",
  "files": $files_json
}
EOF

  log_verbose "Saved manifest to $manifest_file"
}

get_manifest_hash() {
  local file="$1"
  if [[ -n "$MANIFEST_DATA" ]]; then
    if command -v jq &>/dev/null; then
      echo "$MANIFEST_DATA" | jq -r ".files[\"$file\"].synced_hash // \"\"" 2>/dev/null
    else
      # Simple grep-based extraction
      echo "$MANIFEST_DATA" | grep -A2 "\"$file\"" | grep "synced_hash" | sed 's/.*: *"\([^"]*\)".*/\1/' 2>/dev/null
    fi
  fi
}

get_manifest_version() {
  if [[ -n "$MANIFEST_DATA" ]]; then
    if command -v jq &>/dev/null; then
      echo "$MANIFEST_DATA" | jq -r ".boilerplate_version // \"\"" 2>/dev/null
    else
      echo "$MANIFEST_DATA" | grep "boilerplate_version" | sed 's/.*: *"\([^"]*\)".*/\1/' 2>/dev/null
    fi
  fi
}

get_manifest_last_sync() {
  if [[ -n "$MANIFEST_DATA" ]]; then
    if command -v jq &>/dev/null; then
      echo "$MANIFEST_DATA" | jq -r ".last_sync // \"\"" 2>/dev/null
    else
      echo "$MANIFEST_DATA" | grep "last_sync" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/' 2>/dev/null
    fi
  fi
}

# ============================================================================
# FILE ANALYSIS
# ============================================================================

collect_files() {
  local all_files=()

  # Collect files from SYNC_DIRS
  for dir in "${SYNC_DIRS[@]}"; do
    local source_dir="$BOILERPLATE_ROOT/$dir"
    if [[ -d "$source_dir" ]]; then
      while IFS= read -r -d '' file; do
        local rel_path="${file#$BOILERPLATE_ROOT/}"
        # Skip symlinks
        if [[ -L "$file" ]]; then
          log_warn "Skipping symlink: $rel_path"
          continue
        fi
        # Skip excluded patterns
        if ! is_excluded "$rel_path"; then
          all_files+=("$rel_path")
        fi
      done < <(find "$source_dir" -type f -print0 2>/dev/null)
    fi
  done

  # Add individual files from SYNC_FILES
  for file in "${SYNC_FILES[@]}"; do
    local source_file="$BOILERPLATE_ROOT/$file"
    if [[ -f "$source_file" ]] && [[ ! -L "$source_file" ]]; then
      if ! is_excluded "$file"; then
        all_files+=("$file")
      fi
    fi
  done

  # Output unique files
  printf '%s\n' "${all_files[@]}" | sort -u
}

analyze_files() {
  local target="$1"

  log_info "Analyzing files..."

  # Reset arrays
  FILES_NEW=()
  FILES_MODIFIED=()
  FILES_UNCHANGED=()
  FILES_CONFLICTS=()

  # Reset metadata arrays
  FILE_META_NEW=()
  FILE_META_MODIFIED=()
  FILE_META_UNCHANGED=()
  FILE_META_CONFLICT=()

  while IFS= read -r file; do
    local source_file="$BOILERPLATE_ROOT/$file"
    local target_file="$target/$file"

    # Get source file metadata
    local source_size
    source_size=$(get_file_size "$source_file")
    local source_lines
    source_lines=$(get_line_count "$source_file")

    if [[ ! -f "$target_file" ]]; then
      # File doesn't exist in target - it's new
      FILES_NEW+=("$file")
      FILE_META_NEW+=("$file|$source_size|$source_lines")
      log_verbose "NEW: $file"
    else
      # Get target file metadata
      local target_size
      target_size=$(get_file_size "$target_file")
      local target_lines
      target_lines=$(get_line_count "$target_file")

      # File exists - compare hashes
      local source_hash
      source_hash=$(get_file_hash "$source_file")
      local target_hash
      target_hash=$(get_file_hash "$target_file")

      if [[ "$source_hash" == "$target_hash" ]]; then
        FILES_UNCHANGED+=("$file")
        FILE_META_UNCHANGED+=("$file")
        log_verbose "UNCHANGED: $file"
      else
        # Check for conflict (local modification since last sync)
        local manifest_hash
        manifest_hash=$(get_manifest_hash "$file")

        if [[ -n "$manifest_hash" ]] && [[ "$manifest_hash" != "$target_hash" ]]; then
          # Target was modified locally since last sync - this is a conflict
          FILES_CONFLICTS+=("$file")
          FILE_META_CONFLICT+=("$file|$source_size|$target_size")
          log_verbose "CONFLICT: $file"
        else
          # Normal modification (or first sync)
          FILES_MODIFIED+=("$file")
          FILE_META_MODIFIED+=("$file|$source_size|$source_lines|$target_size|$target_lines")
          log_verbose "MODIFIED: $file"
        fi
      fi
    fi
  done < <(collect_files)

  log_info "Analysis complete: ${#FILES_NEW[@]} new, ${#FILES_MODIFIED[@]} modified, ${#FILES_UNCHANGED[@]} unchanged, ${#FILES_CONFLICTS[@]} conflicts"
}

# ============================================================================
# CONFLICT HANDLING
# ============================================================================

show_file_diff() {
  local source_file="$1"
  local target_file="$2"

  if is_binary_file "$source_file"; then
    echo "  Binary files differ"
    return
  fi

  echo ""
  if command -v colordiff &>/dev/null; then
    colordiff -u "$target_file" "$source_file" | head -50
  else
    diff -u "$target_file" "$source_file" | head -50
  fi
  echo ""
}

handle_conflict() {
  local file="$1"
  local source_file="$BOILERPLATE_ROOT/$file"
  local target_file="$TARGET_PATH/$file"

  # Auto-resolve if force mode
  if [[ "$FORCE_MODE" == true ]]; then
    return 0
  fi

  # Auto-skip if skip-conflicts mode
  if [[ "$SKIP_ALL_CONFLICTS" == true ]]; then
    return 1
  fi

  local source_size
  source_size=$(get_file_size "$source_file")
  local target_size
  target_size=$(get_file_size "$target_file")

  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  CONFLICT: $file"
  echo "═══════════════════════════════════════════════════════════"
  echo "  Source (boilerplate): $(format_size $source_size)"
  echo "  Target (local):       $(format_size $target_size) (modified locally)"
  echo ""
  echo "  Options:"
  echo "    [o] Overwrite - Use boilerplate version"
  echo "    [s] Skip      - Keep local version"
  echo "    [d] Diff      - View differences"
  echo "    [a] Overwrite All - Overwrite all remaining conflicts"
  echo "    [n] Skip All  - Keep all local versions"
  echo ""

  while true; do
    read -r -p "  Choose [o/s/d/a/n]: " choice
    case "$choice" in
      o|O)
        return 0
        ;;
      s|S)
        return 1
        ;;
      d|D)
        show_file_diff "$source_file" "$target_file"
        ;;
      a|A)
        FORCE_MODE=true
        return 0
        ;;
      n|N)
        SKIP_ALL_CONFLICTS=true
        return 1
        ;;
      *)
        echo "  Invalid choice. Please enter o, s, d, a, or n."
        ;;
    esac
  done
}

# ============================================================================
# BACKUP
# ============================================================================

create_backup() {
  local target="$1"
  local timestamp
  timestamp=$(get_timestamp_filename)

  # Get project name from target path for ZIP filename
  local project_name
  project_name=$(basename "$target")

  # Create backup directory if it doesn't exist
  mkdir -p "$BACKUPS_DIR"

  # ZIP file path
  local zip_file="$BACKUPS_DIR/backup-${project_name}-${timestamp}.zip"
  CURRENT_BACKUP_DIR="$zip_file"

  # Create temp directory for backup files
  local temp_dir
  temp_dir=$(mktemp -d)
  local backup_content_dir="$temp_dir/backup-${project_name}-${timestamp}"
  mkdir -p "$backup_content_dir"

  log_info "Creating backup..."

  local backed_up=0

  # Backup files that will be modified or are in conflict
  for file in "${FILES_MODIFIED[@]}" "${FILES_CONFLICTS[@]}"; do
    local target_file="$target/$file"
    if [[ -f "$target_file" ]]; then
      local backup_file="$backup_content_dir/$file"
      local backup_dir
      backup_dir=$(dirname "$backup_file")
      mkdir -p "$backup_dir"

      if cp -p "$target_file" "$backup_file" 2>/dev/null; then
        ((backed_up++))
        log_verbose "Backed up: $file"
      else
        log_error "Failed to backup: $file"
        rm -rf "$temp_dir"
        exit $EXIT_BACKUP_ERROR
      fi
    fi
  done

  # Save backup metadata
  cat > "$backup_content_dir/.backup-info.json" << EOF
{
  "timestamp": "$(get_timestamp)",
  "target": "$target",
  "project_name": "$project_name",
  "files_count": $backed_up,
  "boilerplate_version": "$(get_boilerplate_version)"
}
EOF

  # Create ZIP archive
  if command -v zip &>/dev/null; then
    (cd "$temp_dir" && zip -rq "$zip_file" "backup-${project_name}-${timestamp}")
    if [[ $? -eq 0 ]]; then
      local zip_size
      zip_size=$(format_size $(get_file_size "$zip_file"))
      log_success "Backup created: $zip_file ($backed_up files, $zip_size)"
    else
      log_error "Failed to create ZIP archive"
      rm -rf "$temp_dir"
      exit $EXIT_BACKUP_ERROR
    fi
  else
    log_error "zip command not found. Please install zip."
    rm -rf "$temp_dir"
    exit $EXIT_MISSING_DEPENDENCY
  fi

  # Clean up temp directory
  rm -rf "$temp_dir"
}

# ============================================================================
# SYNC
# ============================================================================

sync_file() {
  local file="$1"
  local target="$2"
  local source_file="$BOILERPLATE_ROOT/$file"
  local target_file="$target/$file"
  local target_dir
  target_dir=$(dirname "$target_file")

  # Create directory if needed
  if [[ ! -d "$target_dir" ]]; then
    if [[ "$DRY_RUN" == true ]]; then
      log_verbose "[DRY-RUN] Would create directory: $target_dir"
    else
      mkdir -p "$target_dir"
    fi
  fi

  # Copy file
  if [[ "$DRY_RUN" == true ]]; then
    log_verbose "[DRY-RUN] Would copy: $file"
    return 0
  fi

  if cp -p "$source_file" "$target_file" 2>/dev/null; then
    log_verbose "Copied: $file"
    return 0
  else
    log_error "Failed to copy: $file"
    FILES_ERRORS+=("$file")
    return 1
  fi
}

sync_files() {
  local target="$1"
  local synced=0
  local skipped=0

  log_info "Syncing files..."

  # Sync new files (no conflict possible)
  for file in "${FILES_NEW[@]}"; do
    if sync_file "$file" "$target"; then
      ((synced++))
    fi
  done

  # Sync modified files (no conflict - source and target differ but no local changes)
  for file in "${FILES_MODIFIED[@]}"; do
    if sync_file "$file" "$target"; then
      ((synced++))
    fi
  done

  # Handle conflicts
  for file in "${FILES_CONFLICTS[@]}"; do
    if handle_conflict "$file"; then
      if sync_file "$file" "$target"; then
        ((synced++))
      fi
    else
      ((skipped++))
      log_info "Skipped (kept local): $file"
    fi
  done

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Would sync $synced files, skip $skipped"
  else
    log_success "Synced $synced files, skipped $skipped"
  fi
}

# ============================================================================
# DIFF DISPLAY
# ============================================================================

show_diff() {
  local target="$1"

  echo ""
  echo "─────────────────────────────────────────────────────────────────"
  echo "  DIFF PREVIEW"
  echo "─────────────────────────────────────────────────────────────────"

  for file in "${FILES_MODIFIED[@]}" "${FILES_CONFLICTS[@]}"; do
    local source_file="$BOILERPLATE_ROOT/$file"
    local target_file="$target/$file"

    if [[ -f "$target_file" ]]; then
      echo ""
      echo "📄 $file"

      if is_binary_file "$source_file"; then
        echo "   Binary files differ"
        echo "   Source: $(format_size $(get_file_size "$source_file"))"
        echo "   Target: $(format_size $(get_file_size "$target_file"))"
      else
        # Count line changes
        local added
        local removed
        added=$(diff "$target_file" "$source_file" 2>/dev/null | grep "^>" | wc -l | tr -d ' ')
        removed=$(diff "$target_file" "$source_file" 2>/dev/null | grep "^<" | wc -l | tr -d ' ')
        echo "   +$added lines, -$removed lines"

        # Show snippet of diff
        if [[ "$VERBOSE" == true ]]; then
          show_file_diff "$source_file" "$target_file"
        fi
      fi
    fi
  done

  echo ""
}

# ============================================================================
# RESTORE
# ============================================================================

list_backups() {
  local target="$1"
  local target_name
  target_name=$(basename "$target")

  echo ""
  echo "Available backups for: $target"
  echo ""
  echo "  ID                                              Date                 Files   Size"
  echo "  ─────────────────────────────────────────────────────────────────────────────────────"

  local found=0

  # List ZIP files in backups directory
  for zip_file in "$BACKUPS_DIR"/backup-*.zip; do
    if [[ -f "$zip_file" ]]; then
      local backup_id
      backup_id=$(basename "$zip_file" .zip)

      # Extract metadata from ZIP to check target
      local temp_dir
      temp_dir=$(mktemp -d)

      # Try to extract .backup-info.json from the ZIP
      if unzip -q -o "$zip_file" "*/.backup-info.json" -d "$temp_dir" 2>/dev/null; then
        local info_file
        info_file=$(find "$temp_dir" -name ".backup-info.json" -type f | head -1)

        if [[ -f "$info_file" ]]; then
          local backup_target
          local files_count
          if command -v jq &>/dev/null; then
            backup_target=$(jq -r '.target // ""' "$info_file" 2>/dev/null)
            files_count=$(jq -r '.files_count // 0' "$info_file" 2>/dev/null)
          else
            backup_target=$(grep '"target"' "$info_file" | sed 's/.*: *"\([^"]*\)".*/\1/' 2>/dev/null)
            files_count=$(grep '"files_count"' "$info_file" | sed 's/.*: *\([0-9]*\).*/\1/' 2>/dev/null)
          fi

          # Only show backups for this target
          if [[ "$backup_target" == "$target" ]]; then
            local total_size
            total_size=$(format_size $(get_file_size "$zip_file"))

            # Extract date from backup ID (backup-projectname-YYYY-MM-DD-HH-MM-SS)
            local date_str
            date_str=$(echo "$backup_id" | sed 's/.*-\([0-9]\{4\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)$/\1-\2-\3 \4:\5:\6/')

            printf "  %-45s %-20s %5s   %s\n" "$backup_id" "$date_str" "$files_count" "$total_size"
            ((found++))
          fi
        fi
      fi

      rm -rf "$temp_dir"
    fi
  done

  if [[ $found -eq 0 ]]; then
    echo "  No backups found for this target."
  fi

  echo ""
  echo "Usage: ./scripts/sync.sh --target <path> --restore <ID>"
  echo ""
}

restore_backup() {
  local target="$1"
  local backup_id="$2"

  # Add .zip extension if not provided
  local zip_file
  if [[ "$backup_id" == *.zip ]]; then
    zip_file="$BACKUPS_DIR/$backup_id"
  else
    zip_file="$BACKUPS_DIR/${backup_id}.zip"
  fi

  if [[ ! -f "$zip_file" ]]; then
    log_error "Backup not found: $backup_id"
    log_info "Use --list-backups to see available backups"
    exit $EXIT_GENERAL_ERROR
  fi

  # Check for unzip command
  if ! command -v unzip &>/dev/null; then
    log_error "unzip command not found. Please install unzip."
    exit $EXIT_MISSING_DEPENDENCY
  fi

  log_info "Restoring from backup: $backup_id"

  # Create temp directory for extraction
  local temp_dir
  temp_dir=$(mktemp -d)

  # Extract ZIP to temp directory
  if ! unzip -q "$zip_file" -d "$temp_dir" 2>/dev/null; then
    log_error "Failed to extract backup archive"
    rm -rf "$temp_dir"
    exit $EXIT_GENERAL_ERROR
  fi

  # Find the extracted backup directory (should be backup-projectname-timestamp)
  local backup_content_dir
  backup_content_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -1)

  if [[ -z "$backup_content_dir" ]] || [[ ! -d "$backup_content_dir" ]]; then
    log_error "Invalid backup archive structure"
    rm -rf "$temp_dir"
    exit $EXIT_GENERAL_ERROR
  fi

  local restored=0

  while IFS= read -r -d '' file; do
    local rel_path="${file#$backup_content_dir/}"
    [[ "$rel_path" == ".backup-info.json" ]] && continue

    local target_file="$target/$rel_path"
    local target_dir
    target_dir=$(dirname "$target_file")

    mkdir -p "$target_dir"

    if cp -p "$file" "$target_file" 2>/dev/null; then
      ((restored++))
      log_verbose "Restored: $rel_path"
    else
      log_error "Failed to restore: $rel_path"
    fi
  done < <(find "$backup_content_dir" -type f -print0)

  # Clean up temp directory
  rm -rf "$temp_dir"

  log_success "Restored $restored files from backup"
}

# ============================================================================
# STATUS
# ============================================================================

show_status() {
  local target="$1"

  load_manifest "$target"
  analyze_files "$target"

  local current_version
  current_version=$(get_boilerplate_version)
  local last_version
  last_version=$(get_manifest_version)
  local last_sync
  last_sync=$(get_manifest_last_sync)

  echo ""
  echo "Target: $target"
  echo "Boilerplate version: $current_version"

  if [[ -n "$last_sync" ]]; then
    echo "Last sync: $last_sync (from v$last_version)"

    if [[ "$last_version" != "$current_version" ]]; then
      echo ""
      log_warn "Target was synced from an older version ($last_version)"
      log_warn "Current boilerplate version is $current_version"
    fi
  else
    echo "Last sync: Never"
  fi

  echo ""

  local total_changes=$(( ${#FILES_NEW[@]} + ${#FILES_MODIFIED[@]} + ${#FILES_CONFLICTS[@]} ))

  if [[ $total_changes -eq 0 ]]; then
    echo "Status: UP TO DATE ✓"
  else
    echo "Status: OUT OF DATE"
    echo ""
    echo "Changes pending:"
    [[ ${#FILES_NEW[@]} -gt 0 ]] && echo "  [NEW]       ${#FILES_NEW[@]} files"
    [[ ${#FILES_MODIFIED[@]} -gt 0 ]] && echo "  [MODIFIED]  ${#FILES_MODIFIED[@]} files"
    [[ ${#FILES_CONFLICTS[@]} -gt 0 ]] && echo "  [CONFLICT]  ${#FILES_CONFLICTS[@]} files"
    echo "  [UNCHANGED] ${#FILES_UNCHANGED[@]} files"
    echo ""
    echo "Run with --dry-run --diff to see details."
  fi

  echo ""
}

# ============================================================================
# CLEANUP
# ============================================================================

cleanup_old_files() {
  log_info "Cleaning up old files..."

  local deleted_logs=0
  local deleted_backups=0

  # Delete old log directories (timestamped subfolders)
  while IFS= read -r -d '' dir; do
    rm -rf "$dir"
    ((deleted_logs++))
  done < <(find "$LOGS_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +$LOG_RETENTION_DAYS -print0 2>/dev/null)

  # Delete old backup ZIP files
  while IFS= read -r -d '' file; do
    rm -f "$file"
    ((deleted_backups++))
  done < <(find "$BACKUPS_DIR" -maxdepth 1 -name "backup-*.zip" -mtime +$BACKUP_RETENTION_DAYS -print0 2>/dev/null)

  log_success "Deleted $deleted_logs log directories, $deleted_backups backup archives"
}

# ============================================================================
# BATCH MODE
# ============================================================================

sync_to_target() {
  local target="$1"

  # Validate and expand target path
  target=$(validate_target "$target")
  TARGET_PATH="$target"

  acquire_lock "$target"
  load_manifest "$target"
  analyze_files "$target"

  if [[ "$DRY_RUN" != true ]] && [[ "$BACKUP_ENABLED" == true ]]; then
    if [[ ${#FILES_MODIFIED[@]} -gt 0 ]] || [[ ${#FILES_CONFLICTS[@]} -gt 0 ]]; then
      create_backup "$target"
    fi
  fi

  sync_files "$target"

  if [[ "$DRY_RUN" != true ]]; then
    save_manifest "$target"
  fi

  if [[ "$SHOW_DIFF" == true ]]; then
    show_diff "$target"
  fi

  release_lock
}

run_batch_sync() {
  local targets_file="$SCRIPT_DIR/targets.txt"

  if [[ ! -f "$targets_file" ]]; then
    log_error "Targets file not found: $targets_file"
    log_info "Create the file with project paths (one per line)"
    log_info "See scripts/targets.txt.example for format"
    exit $EXIT_GENERAL_ERROR
  fi

  local total=0
  local success=0
  local failed=0

  while IFS= read -r target || [[ -n "$target" ]]; do
    # Skip comments and empty lines
    [[ "$target" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${target// }" ]] && continue

    # Expand ~ to home directory
    target="${target/#\~/$HOME}"

    ((total++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  [$total] Syncing: $target"
    echo "═══════════════════════════════════════════════════════════"

    if sync_to_target "$target" 2>&1; then
      ((success++))
    else
      ((failed++))
      log_error "Failed: $target"
    fi
  done < "$targets_file"

  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  BATCH COMPLETE"
  echo "  Total: $total | Success: $success | Failed: $failed"
  echo "═══════════════════════════════════════════════════════════"

  [[ $failed -gt 0 ]] && exit $EXIT_BATCH_PARTIAL_FAIL
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

# Format new files section for log
format_new_files_section() {
  if [[ ${#FILE_META_NEW[@]} -eq 0 ]]; then
    return
  fi

  echo ""
  echo "─────────────────────────────────────────────────────────────────"
  echo "  NEW FILES (${#FILE_META_NEW[@]})"
  echo "─────────────────────────────────────────────────────────────────"
  echo ""

  for entry in "${FILE_META_NEW[@]}"; do
    local file size lines
    IFS='|' read -r file size lines <<< "$entry"
    local size_formatted
    size_formatted=$(format_size "$size")
    if [[ "$lines" -gt 0 ]]; then
      echo "  $file ($size_formatted, $lines lines)"
    else
      echo "  $file ($size_formatted)"
    fi
  done
}

# Format modified files section for log
format_modified_files_section() {
  if [[ ${#FILE_META_MODIFIED[@]} -eq 0 ]]; then
    return
  fi

  echo ""
  echo "─────────────────────────────────────────────────────────────────"
  echo "  MODIFIED FILES (${#FILE_META_MODIFIED[@]})"
  echo "─────────────────────────────────────────────────────────────────"
  echo ""

  for entry in "${FILE_META_MODIFIED[@]}"; do
    local file source_size source_lines target_size target_lines
    IFS='|' read -r file source_size source_lines target_size target_lines <<< "$entry"

    local source_size_fmt
    source_size_fmt=$(format_size "$source_size")
    local target_size_fmt
    target_size_fmt=$(format_size "$target_size")

    # Calculate size difference percentage
    local size_diff_pct=""
    if [[ "$target_size" -gt 0 ]]; then
      local diff=$((source_size - target_size))
      local pct=$(echo "scale=1; $diff * 100 / $target_size" | bc 2>/dev/null || echo "0")
      if [[ "$diff" -gt 0 ]]; then
        size_diff_pct=" (+$pct%)"
      elif [[ "$diff" -lt 0 ]]; then
        size_diff_pct=" ($pct%)"
      fi
    fi

    # Calculate line difference
    local line_diff=$((source_lines - target_lines))
    local line_diff_str=""
    if [[ "$line_diff" -gt 0 ]]; then
      line_diff_str=" (+$line_diff)"
    elif [[ "$line_diff" -lt 0 ]]; then
      line_diff_str=" ($line_diff)"
    fi

    echo "  $file"
    echo "    Size:  $target_size_fmt → $source_size_fmt$size_diff_pct"
    if [[ "$source_lines" -gt 0 ]] || [[ "$target_lines" -gt 0 ]]; then
      echo "    Lines: $target_lines → $source_lines$line_diff_str"
    fi
  done
}

# Format unchanged files section (grouped by directory)
format_unchanged_files_section() {
  if [[ ${#FILE_META_UNCHANGED[@]} -eq 0 ]]; then
    return
  fi

  echo ""
  echo "─────────────────────────────────────────────────────────────────"
  echo "  UNCHANGED FILES (${#FILE_META_UNCHANGED[@]})"
  echo "─────────────────────────────────────────────────────────────────"
  echo ""

  # Group files by directory using sort
  local current_dir=""
  for file in $(printf '%s\n' "${FILE_META_UNCHANGED[@]}" | sort); do
    local dir
    dir=$(dirname "$file")
    if [[ "$dir" != "$current_dir" ]]; then
      current_dir="$dir"
      echo "  $dir/"
    fi
    local basename
    basename=$(basename "$file")
    echo "    $basename"
  done
}

# Format conflicts section for log
format_conflicts_section() {
  if [[ ${#FILE_META_CONFLICT[@]} -eq 0 ]]; then
    return
  fi

  echo ""
  echo "─────────────────────────────────────────────────────────────────"
  echo "  CONFLICTS (${#FILE_META_CONFLICT[@]})"
  echo "─────────────────────────────────────────────────────────────────"
  echo ""

  for entry in "${FILE_META_CONFLICT[@]}"; do
    local file source_size target_size
    IFS='|' read -r file source_size target_size <<< "$entry"

    local source_size_fmt
    source_size_fmt=$(format_size "$source_size")
    local target_size_fmt
    target_size_fmt=$(format_size "$target_size")

    echo "  $file"
    echo "    Source: $source_size_fmt | Target: $target_size_fmt (locally modified)"
  done
}

# Format errors section for log
format_errors_section() {
  if [[ ${#FILES_ERRORS[@]} -eq 0 ]]; then
    return
  fi

  echo ""
  echo "─────────────────────────────────────────────────────────────────"
  echo "  ERRORS (${#FILES_ERRORS[@]})"
  echo "─────────────────────────────────────────────────────────────────"
  echo ""

  for file in "${FILES_ERRORS[@]}"; do
    echo "  $file"
  done
}

generate_report() {
  local target="$1"
  local timestamp
  timestamp=$(get_timestamp_filename)

  # Create timestamped log directory
  local log_dir="$LOGS_DIR/$timestamp"
  mkdir -p "$log_dir"

  local log_file="$log_dir/sync.log"
  local json_file="$log_dir/sync.json"
  local version
  version=$(get_boilerplate_version)

  # Calculate totals
  local total_files=$(( ${#FILES_NEW[@]} + ${#FILES_MODIFIED[@]} + ${#FILES_UNCHANGED[@]} ))
  local end_time
  end_time=$(date +%s)
  local duration_ms
  duration_ms=$(( (end_time - START_TIME) * 1000 ))

  # Text report - header and summary
  cat > "$log_file" << EOF
═══════════════════════════════════════════════════════════════
  DESIGN OS BOILERPLATE SYNC
  $(date)
═══════════════════════════════════════════════════════════════

Source: $BOILERPLATE_ROOT
Target: $target
Version: $version

Mode: $(if [[ "$DRY_RUN" == true ]]; then echo "DRY-RUN"; else echo "SYNC"; fi) $(if [[ "$BACKUP_ENABLED" == true ]]; then echo "(with backup)"; fi)

─────────────────────────────────────────────────────────────────
  SUMMARY
─────────────────────────────────────────────────────────────────

  Total files analyzed: $total_files
  ├── New:        ${#FILES_NEW[@]}
  ├── Modified:   ${#FILES_MODIFIED[@]}
  ├── Unchanged:  ${#FILES_UNCHANGED[@]}
  ├── Conflicts:  ${#FILES_CONFLICTS[@]}
  └── Errors:     ${#FILES_ERRORS[@]}

$(if [[ -n "$CURRENT_BACKUP_DIR" ]]; then echo "  Backup: $CURRENT_BACKUP_DIR"; fi)

  Duration: $(( duration_ms / 1000 )).$(( duration_ms % 1000 ))s
EOF

  # Append detailed file sections to log file
  {
    format_new_files_section
    format_modified_files_section
    format_unchanged_files_section
    format_conflicts_section
    format_errors_section

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    if [[ ${#FILES_ERRORS[@]} -eq 0 ]]; then
      echo "  ✓ SYNC COMPLETE"
    else
      echo "  ⚠ SYNC COMPLETED WITH ERRORS"
    fi
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
  } >> "$log_file"

  # JSON report - build file arrays
  local json_new_files=""
  local json_modified_files=""
  local json_unchanged_files=""
  local json_conflict_files=""
  local json_error_files=""
  local first=true

  # Build new files array
  first=true
  for entry in "${FILE_META_NEW[@]}"; do
    local file size lines
    IFS='|' read -r file size lines <<< "$entry"
    [[ "$first" == true ]] && first=false || json_new_files+=","
    json_new_files+=$'\n    {"path": "'"$file"'", "size": '"$size"', "lines": '"$lines"'}'
  done

  # Build modified files array
  first=true
  for entry in "${FILE_META_MODIFIED[@]}"; do
    local file source_size source_lines target_size target_lines
    IFS='|' read -r file source_size source_lines target_size target_lines <<< "$entry"
    [[ "$first" == true ]] && first=false || json_modified_files+=","
    json_modified_files+=$'\n    {"path": "'"$file"'", "source": {"size": '"$source_size"', "lines": '"$source_lines"'}, "target": {"size": '"$target_size"', "lines": '"$target_lines"'}}'
  done

  # Build unchanged files array (just paths)
  first=true
  for file in "${FILE_META_UNCHANGED[@]}"; do
    [[ "$first" == true ]] && first=false || json_unchanged_files+=","
    json_unchanged_files+=$'\n    "'"$file"'"'
  done

  # Build conflict files array
  first=true
  for entry in "${FILE_META_CONFLICT[@]}"; do
    local file source_size target_size
    IFS='|' read -r file source_size target_size <<< "$entry"
    [[ "$first" == true ]] && first=false || json_conflict_files+=","
    json_conflict_files+=$'\n    {"path": "'"$file"'", "source_size": '"$source_size"', "target_size": '"$target_size"'}'
  done

  # Build error files array (just paths)
  first=true
  for file in "${FILES_ERRORS[@]}"; do
    [[ "$first" == true ]] && first=false || json_error_files+=","
    json_error_files+=$'\n    "'"$file"'"'
  done

  cat > "$json_file" << EOF
{
  "timestamp": "$(get_timestamp)",
  "source": "$BOILERPLATE_ROOT",
  "target": "$target",
  "boilerplate_version": "$version",
  "mode": "$(if [[ "$DRY_RUN" == true ]]; then echo "dry-run"; else echo "sync"; fi)",
  "options": {
    "backup": $BACKUP_ENABLED,
    "diff": $SHOW_DIFF,
    "force": $FORCE_MODE
  },
  "summary": {
    "total_files": $total_files,
    "new": ${#FILES_NEW[@]},
    "modified": ${#FILES_MODIFIED[@]},
    "unchanged": ${#FILES_UNCHANGED[@]},
    "conflicts": ${#FILES_CONFLICTS[@]},
    "errors": ${#FILES_ERRORS[@]}
  },
  "files": {
    "new": [$json_new_files
    ],
    "modified": [$json_modified_files
    ],
    "unchanged": [$json_unchanged_files
    ],
    "conflicts": [$json_conflict_files
    ],
    "errors": [$json_error_files
    ]
  },
  "backup_path": "$(if [[ -n "$CURRENT_BACKUP_DIR" ]]; then echo "$CURRENT_BACKUP_DIR"; fi)",
  "duration_ms": $duration_ms
}
EOF

  log_verbose "Report saved: $log_dir/"

  # Print summary to console
  if [[ "$QUIET" != true ]]; then
    echo ""
    echo "─────────────────────────────────────────────────────────────────"
    echo "  SUMMARY"
    echo "─────────────────────────────────────────────────────────────────"
    echo ""
    echo "  Total files: $total_files"
    echo "  ├── New:        ${#FILES_NEW[@]}"
    echo "  ├── Modified:   ${#FILES_MODIFIED[@]}"
    echo "  ├── Unchanged:  ${#FILES_UNCHANGED[@]}"
    echo "  ├── Conflicts:  ${#FILES_CONFLICTS[@]}"
    echo "  └── Errors:     ${#FILES_ERRORS[@]}"
    echo ""
    if [[ -n "$CURRENT_BACKUP_DIR" ]]; then
      echo "  Backup: $CURRENT_BACKUP_DIR"
      echo ""
    fi
    echo "  Duration: $(( duration_ms / 1000 )).$(( duration_ms % 1000 ))s"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    if [[ ${#FILES_ERRORS[@]} -eq 0 ]]; then
      echo "  ✓ SYNC COMPLETE"
    else
      echo "  ⚠ SYNC COMPLETED WITH ERRORS"
    fi
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
  fi
}

# ============================================================================
# CREATE MODE
# ============================================================================

# Validate target path for create mode
validate_create_target() {
  local target="$1"

  # Expand ~ to home directory
  target="${target/#\~/$HOME}"

  # Check if parent directory exists
  local parent_dir
  parent_dir=$(dirname "$target")
  if [[ ! -d "$parent_dir" ]]; then
    log_error "Parent directory does not exist: $parent_dir"
    exit $EXIT_GENERAL_ERROR
  fi

  # Check write permissions
  if [[ ! -w "$parent_dir" ]]; then
    log_error "No write permission for: $parent_dir"
    exit $EXIT_GENERAL_ERROR
  fi

  # Check if target exists and is not empty
  if [[ -d "$target" ]] && [[ -n "$(ls -A "$target" 2>/dev/null)" ]]; then
    echo ""
    log_warn "Directory exists and is not empty: $target"
    echo ""
    echo "Contents may be overwritten. Continue? [y/N]"
    read -r response
    if [[ "$response" != "y" ]] && [[ "$response" != "Y" ]]; then
      log_info "Create cancelled by user"
      exit $EXIT_CREATE_CANCELLED
    fi
  fi

  # Return expanded path
  echo "$target"
}

# Copy boilerplate files to target
copy_boilerplate() {
  local target="$1"
  local copied=0
  local skipped=0

  log_info "Copying boilerplate files..."

  # Create target directory
  mkdir -p "$target"

  # Use temp file for bash 3.2 compatibility (avoid process substitution issues)
  local temp_file
  temp_file=$(mktemp)
  find "$BOILERPLATE_ROOT" -type f -print0 > "$temp_file" 2>/dev/null

  while IFS= read -r -d '' file; do
    local rel_path="${file#$BOILERPLATE_ROOT/}"

    # Skip if excluded
    if is_create_excluded "$rel_path"; then
      ((skipped++))
      log_verbose "Skipped: $rel_path"
      continue
    fi

    # Skip symlinks
    if [[ -L "$file" ]]; then
      log_verbose "Skipped symlink: $rel_path"
      continue
    fi

    # Create target directory
    local target_dir
    target_dir=$(dirname "$target/$rel_path")
    mkdir -p "$target_dir"

    # Copy file
    if cp -p "$file" "$target/$rel_path" 2>/dev/null; then
      ((copied++))
      log_verbose "Copied: $rel_path"
    else
      log_error "Failed to copy: $rel_path"
      rm -f "$temp_file"
      exit $EXIT_CREATE_COPY_ERROR
    fi
  done < "$temp_file"

  rm -f "$temp_file"

  log_success "Copied $copied files (skipped $skipped)"
}

# Create gitkeep files in empty directories
create_gitkeeps() {
  local target="$1"

  log_info "Creating .gitkeep files..."

  # product/ folder
  mkdir -p "$target/product"
  touch "$target/product/.gitkeep"

  # src/sections/ folder
  mkdir -p "$target/src/sections"
  touch "$target/src/sections/.gitkeep"

  # src/shell/components/ folder
  mkdir -p "$target/src/shell/components"
  touch "$target/src/shell/components/.gitkeep"

  log_verbose "Created .gitkeep files in product/, src/sections/, src/shell/components/"
}

# Transform package.json with project name
transform_package_json() {
  local target="$1"
  local name="$2"
  local package_file="$target/package.json"

  if [[ ! -f "$package_file" ]]; then
    log_warn "package.json not found, skipping transformation"
    return
  fi

  # Sanitize name for npm
  local sanitized_name
  sanitized_name=$(sanitize_project_name "$name")

  log_info "Updating package.json..."

  # Use sed to replace the name field
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$sanitized_name\"/" "$package_file"
  else
    sed -i "s/\"name\": \"[^\"]*\"/\"name\": \"$sanitized_name\"/" "$package_file"
  fi

  log_success "Updated package.json (name: \"$sanitized_name\")"
}

# Transform index.html with project name
transform_index_html() {
  local target="$1"
  local name="$2"
  local html_file="$target/index.html"

  if [[ ! -f "$html_file" ]]; then
    log_warn "index.html not found, skipping transformation"
    return
  fi

  log_info "Updating index.html..."

  # Use sed to replace the title
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s/<title>[^<]*<\/title>/<title>$name<\/title>/" "$html_file"
  else
    sed -i "s/<title>[^<]*<\/title>/<title>$name<\/title>/" "$html_file"
  fi

  log_success "Updated index.html title"
}

# Generate README.md for new project
generate_readme() {
  local target="$1"
  local name="$2"

  log_info "Generating README.md..."

  cat > "$target/README.md" << EOF
# $name

Built with [Design OS](https://github.com/buildermethods/design-os).

## Getting Started

\`\`\`bash
npm run dev
\`\`\`

## Design OS Commands

- \`/product-vision\` - Define product overview
- \`/product-roadmap\` - Plan development sections
- \`/data-model\` - Design data structures
- \`/design-tokens\` - Set colors and typography
- \`/design-shell\` - Create app navigation
- \`/shape-section\` - Define section specs
- \`/sample-data\` - Generate test data
- \`/design-screen\` - Design UI screens
- \`/screenshot-design\` - Capture screenshots
- \`/export-product\` - Export for implementation

## Sync with Boilerplate

\`\`\`bash
# Check for updates
./scripts/sync.sh --target . --status

# Sync updates
./scripts/sync.sh --target . --dry-run
./scripts/sync.sh --target .
\`\`\`
EOF

  log_success "Generated README.md"
}

# Initialize git repository
init_git() {
  local target="$1"
  local version
  version=$(get_boilerplate_version)

  log_info "Initializing git repository..."

  # Change to target directory
  cd "$target" || exit $EXIT_CREATE_GIT_ERROR

  # Initialize git
  if ! git init &>/dev/null; then
    log_warn "git init failed"
    return 1
  fi

  # Add all files
  if ! git add . &>/dev/null; then
    log_warn "git add failed"
    return 1
  fi

  # Create initial commit
  local commit_msg="Initial project from Design OS boilerplate v$version

🤖 Generated with Design OS Boilerplate"

  if ! git commit -m "$commit_msg" &>/dev/null; then
    log_warn "git commit failed"
    return 1
  fi

  log_success "Git repository initialized with initial commit"
  return 0
}

# Run npm install
run_npm_install() {
  local target="$1"

  log_info "Installing dependencies..."

  # Change to target directory
  cd "$target" || exit $EXIT_CREATE_NPM_ERROR

  # Run npm install
  if npm install 2>&1 | tail -5; then
    local pkg_count
    pkg_count=$(npm list --depth=0 2>/dev/null | wc -l | tr -d ' ')
    log_success "npm install completed ($pkg_count packages)"
    return 0
  else
    log_warn "npm install failed - you can run it manually later"
    return 1
  fi
}

# Create initial sync manifest
create_initial_manifest() {
  local target="$1"
  local version
  version=$(get_boilerplate_version)
  local timestamp
  timestamp=$(get_timestamp)

  cat > "$target/.sync-manifest.json" << EOF
{
  "last_sync": "$timestamp",
  "boilerplate_version": "$version",
  "created_from_boilerplate": true,
  "files": {}
}
EOF

  log_verbose "Created initial sync manifest"
}

# Show create report
show_create_report() {
  local target="$1"
  local name="$2"

  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  ✓ PROJECT CREATED SUCCESSFULLY"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "  Project: $name"
  echo "  Location: $target"
  echo ""
  echo "  Next steps:"
  echo "    cd $target"
  [[ "$NO_INSTALL" == true ]] && echo "    npm install"
  echo "    npm run dev"
  echo ""
  echo "  Start designing:"
  echo "    /product-vision    - Define your product"
  echo "    /product-roadmap   - Plan your sections"
  echo ""
  echo "  Documentation:"
  echo "    ./docs/getting-started.md"
  echo ""
}

# Main create project function
create_project() {
  local target="$1"
  local name="$2"

  # Validate target
  target=$(validate_create_target "$target")
  CREATE_PATH="$target"

  # Default name to folder name if not provided
  if [[ -z "$name" ]]; then
    name=$(basename "$target")
  fi

  log_info "Creating project: $name"
  log_info "Location: $target"

  # Copy boilerplate files
  copy_boilerplate "$target"

  # Create gitkeep files
  create_gitkeeps "$target"

  # Transform files
  transform_package_json "$target" "$name"
  transform_index_html "$target" "$name"
  generate_readme "$target" "$name"

  # Create manifest
  create_initial_manifest "$target"

  # Initialize git (if not --no-git)
  if [[ "$NO_GIT" != true ]]; then
    init_git "$target" || true
  fi

  # Run npm install (if not --no-install)
  if [[ "$NO_INSTALL" != true ]]; then
    run_npm_install "$target" || true
  fi

  # Show report
  show_create_report "$target" "$name"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
  START_TIME=$(date +%s)

  parse_arguments "$@"
  validate_environment

  # Print header
  if [[ "$QUIET" != true ]]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    if [[ "$CREATE_MODE" == true ]]; then
      echo "  DESIGN OS - CREATE NEW PROJECT"
    else
      echo "  DESIGN OS BOILERPLATE SYNC"
    fi
    echo "  Version: $(get_boilerplate_version)"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
  fi

  # Create mode
  if [[ "$CREATE_MODE" == true ]]; then
    if [[ -z "$CREATE_PATH" ]]; then
      log_error "--create requires a path"
      exit $EXIT_GENERAL_ERROR
    fi
    create_project "$CREATE_PATH" "$PROJECT_NAME"
    exit $EXIT_SUCCESS
  fi

  # Standalone operations
  if [[ "$CLEANUP_MODE" == true ]]; then
    cleanup_old_files
    exit $EXIT_SUCCESS
  fi

  # Operations requiring --target
  if [[ "$LIST_BACKUPS_MODE" == true ]]; then
    if [[ -z "$TARGET_PATH" ]]; then
      log_error "--list-backups requires --target"
      exit $EXIT_GENERAL_ERROR
    fi
    TARGET_PATH=$(validate_target "$TARGET_PATH")
    list_backups "$TARGET_PATH"
    exit $EXIT_SUCCESS
  fi

  if [[ "$STATUS_MODE" == true ]]; then
    if [[ -z "$TARGET_PATH" ]]; then
      log_error "--status requires --target"
      exit $EXIT_GENERAL_ERROR
    fi
    TARGET_PATH=$(validate_target "$TARGET_PATH")
    show_status "$TARGET_PATH"
    exit $EXIT_SUCCESS
  fi

  if [[ "$RESTORE_MODE" == true ]]; then
    if [[ -z "$TARGET_PATH" ]]; then
      log_error "--restore requires --target"
      exit $EXIT_GENERAL_ERROR
    fi
    TARGET_PATH=$(validate_target "$TARGET_PATH")
    restore_backup "$TARGET_PATH" "$RESTORE_ID"
    exit $EXIT_SUCCESS
  fi

  # Batch mode
  if [[ "$BATCH_MODE" == true ]]; then
    run_batch_sync
    exit $EXIT_SUCCESS
  fi

  # Single target sync
  if [[ -z "$TARGET_PATH" ]]; then
    log_error "Missing --target, --batch, or --create"
    echo "Use --help for usage information"
    exit $EXIT_GENERAL_ERROR
  fi

  TARGET_PATH=$(validate_target "$TARGET_PATH")

  log_info "Source: $BOILERPLATE_ROOT"
  log_info "Target: $TARGET_PATH"

  acquire_lock "$TARGET_PATH"
  load_manifest "$TARGET_PATH"

  # Version warning
  local last_version
  last_version=$(get_manifest_version)
  local current_version
  current_version=$(get_boilerplate_version)

  if [[ -n "$last_version" ]] && [[ "$last_version" != "$current_version" ]]; then
    echo ""
    log_warn "Target was last synced from version $last_version"
    log_warn "Current boilerplate version is $current_version"
    echo ""
  fi

  analyze_files "$TARGET_PATH"

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] No changes will be made"
  else
    if [[ "$BACKUP_ENABLED" == true ]]; then
      if [[ ${#FILES_MODIFIED[@]} -gt 0 ]] || [[ ${#FILES_CONFLICTS[@]} -gt 0 ]]; then
        create_backup "$TARGET_PATH"
      fi
    fi

    sync_files "$TARGET_PATH"
    save_manifest "$TARGET_PATH"
  fi

  if [[ "$SHOW_DIFF" == true ]]; then
    show_diff "$TARGET_PATH"
  fi

  generate_report "$TARGET_PATH"

  if [[ "$AUTO_CLEANUP" == true ]] && [[ "$DRY_RUN" != true ]]; then
    cleanup_old_files
  fi

  release_lock

  [[ ${#FILES_ERRORS[@]} -eq 0 ]] && exit $EXIT_SUCCESS || exit $EXIT_COPY_ERROR
}

main "$@"
