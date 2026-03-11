#!/bin/bash
# sync-config.sh - Configuration for Design OS Boilerplate Sync
# This file is sourced by sync.sh and sync-watch.sh

# ============================================================================
# DIRECTORIES TO SYNC (recursive)
# ============================================================================
SYNC_DIRS=(
  ".claude/commands/design-os"
  ".claude/skills/frontend-design"
  ".claude/agents"
  "src/components"
  "src/components/ui"
  "src/lib"
  "src/types"
  "docs"
)

# ============================================================================
# INDIVIDUAL FILES TO SYNC
# ============================================================================
SYNC_FILES=(
  "agents.md"
  "CLAUDE.md"
  "package.json"
  "vite.config.ts"
  "tsconfig.json"
  "tsconfig.app.json"
  "tsconfig.node.json"
  "eslint.config.js"
  "index.html"
  ".gitignore"
  "src/main.tsx"
  "src/index.css"
)

# ============================================================================
# EXCLUDE PATTERNS (project-specific files that should NOT be synced)
# ============================================================================
EXCLUDE_PATTERNS=(
  "product/*"
  "product-plan/*"
  "node_modules/*"
  "dist/*"
  ".vite/*"
  "*.log"
  "FORK_CHANGELOG.md"
  "README.md"
  "fix-plan.md"
  ".sync-manifest.json"
  ".sync.lock"
  ".claude/plans/*"
)

# ============================================================================
# CREATE MODE - EXCLUDE PATTERNS
# These patterns define what to EXCLUDE when creating a new project
# ============================================================================

# Directories to exclude when creating a new project
CREATE_EXCLUDE_DIRS=(
  ".git"
  ".github"
  "node_modules"
  "dist"
  ".vite"
  "scripts/logs"
  ".playwright-mcp"
  ".claude/plans"
  "product"
  "product-plan"
  "src/sections"
  "src/shell/components"
)

# Files to exclude when creating a new project
CREATE_EXCLUDE_FILES=(
  "FORK_CHANGELOG.md"
  "fix-plan.md"
  "VERSION"
  "scripts/targets.txt"
  ".claude/settings.local.json"
  ".DS_Store"
)

# File extensions to exclude
CREATE_EXCLUDE_EXTENSIONS=(
  "log"
)

# ============================================================================
# CREATE MODE - HELPER FUNCTIONS
# ============================================================================

# Check if path should be excluded in create mode
is_create_excluded() {
  local _excl_path="$1"
  local _excl_basename
  _excl_basename=$(basename "$_excl_path")

  # Check excluded directories
  for _excl_dir in "${CREATE_EXCLUDE_DIRS[@]}"; do
    if [[ "$_excl_path" == "$_excl_dir" ]] || [[ "$_excl_path" == "$_excl_dir/"* ]]; then
      return 0
    fi
  done

  # Check excluded files
  for _excl_file in "${CREATE_EXCLUDE_FILES[@]}"; do
    if [[ "$_excl_path" == "$_excl_file" ]] || [[ "$_excl_basename" == "$_excl_file" ]]; then
      return 0
    fi
  done

  # Check excluded extensions
  local _excl_ext="${_excl_path##*.}"
  for _excl_ext_pattern in "${CREATE_EXCLUDE_EXTENSIONS[@]}"; do
    if [[ "$_excl_ext" == "$_excl_ext_pattern" ]]; then
      return 0
    fi
  done

  return 1
}

# Sanitize project name for npm package.json
sanitize_project_name() {
  local name="$1"
  name=$(echo "$name" | tr '[:upper:]' '[:lower:]')
  name=$(echo "$name" | tr ' ' '-')
  name=$(echo "$name" | sed 's/[^a-z0-9-]//g')
  name=$(echo "$name" | sed 's/-\+/-/g')
  name=$(echo "$name" | sed 's/^-//;s/-$//')
  name=$(echo "$name" | cut -c1-214)
  echo "$name"
}

# ============================================================================
# RETENTION SETTINGS
# ============================================================================
BACKUP_RETENTION_DAYS=30
LOG_RETENTION_DAYS=7
AUTO_CLEANUP=true

# ============================================================================
# PATHS (calculated automatically)
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOILERPLATE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"
BACKUPS_DIR="$LOGS_DIR/backups"

# ============================================================================
# FUNCTIONS
# ============================================================================

# Get boilerplate version from package.json
get_boilerplate_version() {
  local package_file="$BOILERPLATE_ROOT/package.json"
  if [[ -f "$package_file" ]]; then
    grep '"version"' "$package_file" | sed 's/.*: *"\([^"]*\)".*/\1/' | tr -d '\n'
  else
    echo "unknown"
  fi
}

# Check if a path matches any exclude pattern
is_excluded() {
  local path="$1"
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    case "$path" in
      $pattern) return 0 ;;
    esac
    if [[ "$path" == *"$pattern"* ]] && [[ "$pattern" != *"*"* ]]; then
      return 0
    fi
  done
  return 1
}

# Check if file is binary
is_binary_file() {
  local file="$1"
  local ext="${file##*.}"
  case "$ext" in
    png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff)
      return 0 ;;
    woff|woff2|ttf|eot|otf)
      return 0 ;;
    pdf|zip|tar|gz|bz2|xz|7z|rar)
      return 0 ;;
    exe|dll|so|dylib|bin)
      return 0 ;;
    *)
      if command -v file &>/dev/null; then
        file -b --mime-encoding "$file" 2>/dev/null | grep -q "binary"
        return $?
      fi
      return 1 ;;
  esac
}

# Format bytes to human readable
format_size() {
  local bytes=$1
  if [[ $bytes -lt 1024 ]]; then
    echo "${bytes} B"
  elif [[ $bytes -lt 1048576 ]]; then
    echo "$(( bytes / 1024 )).$(( (bytes % 1024) * 10 / 1024 )) KB"
  elif [[ $bytes -lt 1073741824 ]]; then
    echo "$(( bytes / 1048576 )).$(( (bytes % 1048576) * 10 / 1048576 )) MB"
  else
    echo "$(( bytes / 1073741824 )).$(( (bytes % 1073741824) * 10 / 1073741824 )) GB"
  fi
}

# Get file size in bytes
get_file_size() {
  local file="$1"
  if [[ -f "$file" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
      stat -f%z "$file" 2>/dev/null || echo 0
    else
      stat -c%s "$file" 2>/dev/null || echo 0
    fi
  else
    echo 0
  fi
}

# Get file hash (MD5)
get_file_hash() {
  local file="$1"
  if [[ -f "$file" ]]; then
    if command -v md5sum &>/dev/null; then
      md5sum "$file" 2>/dev/null | cut -d' ' -f1
    elif command -v md5 &>/dev/null; then
      md5 -q "$file" 2>/dev/null
    else
      echo "$(get_file_size "$file")-$(stat -f%m "$file" 2>/dev/null || stat -c%Y "$file" 2>/dev/null)"
    fi
  else
    echo ""
  fi
}

# Get current timestamp in ISO format
get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Get timestamp for filenames
get_timestamp_filename() {
  date +"%Y-%m-%d-%H-%M-%S"
}
