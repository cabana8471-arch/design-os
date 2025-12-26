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

REQUIRED (for sync/restore/status):
  --target <path>       Path to target project

OPTIONS:
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

  while IFS= read -r file; do
    local source_file="$BOILERPLATE_ROOT/$file"
    local target_file="$target/$file"

    if [[ ! -f "$target_file" ]]; then
      # File doesn't exist in target - it's new
      FILES_NEW+=("$file")
      log_verbose "NEW: $file"
    else
      # File exists - compare hashes
      local source_hash
      source_hash=$(get_file_hash "$source_file")
      local target_hash
      target_hash=$(get_file_hash "$target_file")

      if [[ "$source_hash" == "$target_hash" ]]; then
        FILES_UNCHANGED+=("$file")
        log_verbose "UNCHANGED: $file"
      else
        # Check for conflict (local modification since last sync)
        local manifest_hash
        manifest_hash=$(get_manifest_hash "$file")

        if [[ -n "$manifest_hash" ]] && [[ "$manifest_hash" != "$target_hash" ]]; then
          # Target was modified locally since last sync - this is a conflict
          FILES_CONFLICTS+=("$file")
          log_verbose "CONFLICT: $file"
        else
          # Normal modification (or first sync)
          FILES_MODIFIED+=("$file")
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
  CURRENT_BACKUP_DIR="$BACKUPS_DIR/$timestamp"

  log_info "Creating backup..."
  mkdir -p "$CURRENT_BACKUP_DIR"

  local backed_up=0

  # Backup files that will be modified or are in conflict
  for file in "${FILES_MODIFIED[@]}" "${FILES_CONFLICTS[@]}"; do
    local target_file="$target/$file"
    if [[ -f "$target_file" ]]; then
      local backup_file="$CURRENT_BACKUP_DIR/$file"
      local backup_dir
      backup_dir=$(dirname "$backup_file")
      mkdir -p "$backup_dir"

      if cp -p "$target_file" "$backup_file" 2>/dev/null; then
        ((backed_up++))
        log_verbose "Backed up: $file"
      else
        log_error "Failed to backup: $file"
        exit $EXIT_BACKUP_ERROR
      fi
    fi
  done

  # Save backup metadata
  cat > "$CURRENT_BACKUP_DIR/.backup-info.json" << EOF
{
  "timestamp": "$(get_timestamp)",
  "target": "$target",
  "files_count": $backed_up,
  "boilerplate_version": "$(get_boilerplate_version)"
}
EOF

  log_success "Backup created: $CURRENT_BACKUP_DIR ($backed_up files)"
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

  echo ""
  echo "Available backups for: $target"
  echo ""
  echo "  ID                      Date                 Files   Size"
  echo "  ─────────────────────────────────────────────────────────────"

  local found=0

  for backup_dir in "$BACKUPS_DIR"/*/; do
    if [[ -d "$backup_dir" ]]; then
      local backup_id
      backup_id=$(basename "$backup_dir")
      local info_file="$backup_dir/.backup-info.json"

      if [[ -f "$info_file" ]]; then
        local backup_target
        if command -v jq &>/dev/null; then
          backup_target=$(jq -r '.target // ""' "$info_file" 2>/dev/null)
        else
          backup_target=$(grep '"target"' "$info_file" | sed 's/.*: *"\([^"]*\)".*/\1/' 2>/dev/null)
        fi

        # Only show backups for this target
        if [[ "$backup_target" == "$target" ]]; then
          local files_count
          files_count=$(find "$backup_dir" -type f ! -name ".backup-info.json" | wc -l | tr -d ' ')
          local total_size
          total_size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1)

          # Format date from ID
          local date_str
          date_str=$(echo "$backup_id" | sed 's/\([0-9]\{4\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')

          printf "  %-22s %-20s %5s   %s\n" "$backup_id" "$date_str" "$files_count" "$total_size"
          ((found++))
        fi
      fi
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
  local backup_dir="$BACKUPS_DIR/$backup_id"

  if [[ ! -d "$backup_dir" ]]; then
    log_error "Backup not found: $backup_id"
    log_info "Use --list-backups to see available backups"
    exit $EXIT_GENERAL_ERROR
  fi

  log_info "Restoring from backup: $backup_id"

  local restored=0

  while IFS= read -r -d '' file; do
    local rel_path="${file#$backup_dir/}"
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
  done < <(find "$backup_dir" -type f -print0)

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

  # Delete old log files
  while IFS= read -r -d '' file; do
    rm -f "$file"
    ((deleted_logs++))
  done < <(find "$LOGS_DIR" -maxdepth 1 \( -name "sync-*.log" -o -name "sync-*.json" \) -mtime +$LOG_RETENTION_DAYS -print0 2>/dev/null)

  # Delete old backup directories
  while IFS= read -r -d '' dir; do
    rm -rf "$dir"
    ((deleted_backups++))
  done < <(find "$BACKUPS_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +$BACKUP_RETENTION_DAYS -print0 2>/dev/null)

  log_success "Deleted $deleted_logs log files, $deleted_backups backup directories"
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

generate_report() {
  local target="$1"
  local timestamp
  timestamp=$(get_timestamp_filename)
  local log_file="$LOGS_DIR/sync-$timestamp.log"
  local json_file="$LOGS_DIR/sync-$timestamp.json"
  local version
  version=$(get_boilerplate_version)

  # Calculate totals
  local total_files=$(( ${#FILES_NEW[@]} + ${#FILES_MODIFIED[@]} + ${#FILES_UNCHANGED[@]} ))
  local end_time
  end_time=$(date +%s)
  local duration_ms
  duration_ms=$(( (end_time - START_TIME) * 1000 ))

  # Text report
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

═══════════════════════════════════════════════════════════════
  $(if [[ ${#FILES_ERRORS[@]} -eq 0 ]]; then echo "✓ SYNC COMPLETE"; else echo "⚠ SYNC COMPLETED WITH ERRORS"; fi)
═══════════════════════════════════════════════════════════════
EOF

  # JSON report
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
  "backup_path": "$(if [[ -n "$CURRENT_BACKUP_DIR" ]]; then echo "$CURRENT_BACKUP_DIR"; fi)",
  "duration_ms": $duration_ms
}
EOF

  log_verbose "Report saved: $log_file"

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
    echo "  DESIGN OS BOILERPLATE SYNC"
    echo "  Version: $(get_boilerplate_version)"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
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
    log_error "Missing --target or --batch"
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
