#!/bin/bash
# sync-watch.sh - Watch mode for Design OS Boilerplate Sync
# Monitors file changes and automatically syncs to target project

set -e

# ============================================================================
# INITIALIZATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/sync-config.sh"

# ============================================================================
# WATCH CONFIGURATION
# ============================================================================

# Use the same directories and files as sync-config.sh for consistency
# This ensures watch mode triggers for ALL files that would be synced
WATCH_DIRS=("${SYNC_DIRS[@]}")
WATCH_FILES=("${SYNC_FILES[@]}")

# Debounce delay in seconds (avoid rapid re-syncs)
DEBOUNCE_DELAY=2

# ============================================================================
# OPTIONS
# ============================================================================

TARGET_PATH=""
SYNC_OPTIONS=""
VERBOSE=false

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

show_help() {
  cat << 'EOF'
Design OS Boilerplate Watch Mode

USAGE:
  ./scripts/sync-watch.sh --target <path> [options]

REQUIRED:
  --target <path>     Path to target project to sync

OPTIONS:
  --force             Auto-overwrite conflicts (no prompts)
  --skip-conflicts    Auto-skip conflicts (keep local versions)
  --no-backup         Disable backup on each sync
  --verbose           Show detailed output
  --help              Show this help

EXAMPLES:
  # Basic watch mode
  ./scripts/sync-watch.sh --target ~/projects/my-app

  # Watch with auto-overwrite
  ./scripts/sync-watch.sh --target ~/projects/my-app --force

  # Watch with verbose output
  ./scripts/sync-watch.sh --target ~/projects/my-app --verbose

REQUIREMENTS:
  - macOS: fswatch (brew install fswatch)
  - Linux: inotifywait (apt install inotify-tools)

Press Ctrl+C to stop watching.
EOF
}

parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --target)
        TARGET_PATH="$2"
        shift 2
        ;;
      --force)
        SYNC_OPTIONS="$SYNC_OPTIONS --force"
        shift
        ;;
      --skip-conflicts)
        SYNC_OPTIONS="$SYNC_OPTIONS --skip-conflicts"
        shift
        ;;
      --no-backup)
        SYNC_OPTIONS="$SYNC_OPTIONS --no-backup"
        shift
        ;;
      --verbose)
        VERBOSE=true
        SYNC_OPTIONS="$SYNC_OPTIONS --verbose"
        shift
        ;;
      --help|-h)
        show_help
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  done

  if [[ -z "$TARGET_PATH" ]]; then
    echo "ERROR: --target is required"
    echo "Use --help for usage information"
    exit 1
  fi

  # Expand ~ to home directory
  TARGET_PATH="${TARGET_PATH/#\~/$HOME}"

  # Validate target exists
  if [[ ! -d "$TARGET_PATH" ]]; then
    echo "ERROR: Target directory does not exist: $TARGET_PATH"
    exit 1
  fi
}

# ============================================================================
# WATCH FUNCTIONS
# ============================================================================

build_watch_paths() {
  local paths=""

  for dir in "${WATCH_DIRS[@]}"; do
    local full_path="$BOILERPLATE_ROOT/$dir"
    if [[ -d "$full_path" ]]; then
      paths="$paths $full_path"
    fi
  done

  for file in "${WATCH_FILES[@]}"; do
    local full_path="$BOILERPLATE_ROOT/$file"
    if [[ -f "$full_path" ]]; then
      paths="$paths $full_path"
    fi
  done

  echo "$paths"
}

run_sync() {
  local changed_file="$1"

  echo ""
  echo "────────────────────────────────────────────────────────────"
  echo "  Change detected: $(basename "$changed_file")"
  echo "  $(date '+%Y-%m-%d %H:%M:%S')"
  echo "────────────────────────────────────────────────────────────"

  # Run sync with quiet mode unless verbose
  local quiet_opt=""
  [[ "$VERBOSE" != true ]] && quiet_opt="--quiet"

  if "$SCRIPT_DIR/sync.sh" --target "$TARGET_PATH" $SYNC_OPTIONS $quiet_opt; then
    echo "✓ Sync complete"
  else
    echo "✗ Sync failed"
  fi

  echo ""
  echo "Watching for changes... (Ctrl+C to stop)"
}

start_watch_fswatch() {
  local watch_paths
  watch_paths=$(build_watch_paths)

  echo "Starting fswatch..."
  [[ "$VERBOSE" == true ]] && echo "Watching: $watch_paths"

  local last_sync=0

  # Use fswatch with latency to debounce
  fswatch -o --latency "$DEBOUNCE_DELAY" $watch_paths | while read -r num; do
    local now
    now=$(date +%s)

    # Additional debounce check
    if [[ $((now - last_sync)) -ge $DEBOUNCE_DELAY ]]; then
      run_sync "multiple files"
      last_sync=$now
    fi
  done
}

start_watch_inotify() {
  local watch_paths
  watch_paths=$(build_watch_paths)

  echo "Starting inotifywait..."
  [[ "$VERBOSE" == true ]] && echo "Watching: $watch_paths"

  local last_sync=0

  while true; do
    # Wait for file changes
    local changed_file
    changed_file=$(inotifywait -r -e modify,create,delete --format '%w%f' $watch_paths 2>/dev/null || true)

    if [[ -n "$changed_file" ]]; then
      local now
      now=$(date +%s)

      # Debounce
      if [[ $((now - last_sync)) -ge $DEBOUNCE_DELAY ]]; then
        run_sync "$changed_file"
        last_sync=$now
      fi
    fi
  done
}

start_watch() {
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  DESIGN OS WATCH MODE"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "  Source: $BOILERPLATE_ROOT"
  echo "  Target: $TARGET_PATH"
  echo "  Options: ${SYNC_OPTIONS:-none}"
  echo ""
  echo "  Watching for changes... (Ctrl+C to stop)"
  echo ""

  # Detect available watch tool
  if command -v fswatch &>/dev/null; then
    start_watch_fswatch
  elif command -v inotifywait &>/dev/null; then
    start_watch_inotify
  else
    echo ""
    echo "ERROR: No file watcher found!"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "  macOS:  brew install fswatch"
    echo "  Ubuntu: sudo apt install inotify-tools"
    echo "  Fedora: sudo dnf install inotify-tools"
    echo ""
    exit 1
  fi
}

# ============================================================================
# SIGNAL HANDLING
# ============================================================================

cleanup() {
  echo ""
  echo ""
  echo "Watch mode stopped."
  exit 0
}

trap cleanup INT TERM

# ============================================================================
# MAIN
# ============================================================================

parse_arguments "$@"
start_watch
