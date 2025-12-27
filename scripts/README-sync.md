# Design OS Boilerplate Sync

Synchronization script for keeping Design OS projects up-to-date with the boilerplate and for creating new projects.

## Features

- **Create Mode** - Creates new projects from the boilerplate
- **Sync Mode** - Synchronizes existing projects with boilerplate updates
- **Batch Mode** - Synchronizes multiple projects simultaneously
- **Backup & Restore** - Automatic backup before modifications

## Requirements

- **Bash 3.2+** (macOS) or **Bash 4.0+** (Linux)
- **diff** (included in system)
- **jq** (optional, for JSON formatting)
- **fswatch** (optional, for watch mode on macOS)
- **inotify-tools** (optional, for watch mode on Linux)

Installing optional dependencies:
```bash
# macOS
brew install jq fswatch

# Ubuntu/Debian
sudo apt install jq inotify-tools

# Fedora
sudo dnf install jq inotify-tools
```

## Quick Start

```bash
# Create a new project
./scripts/sync.sh --create ~/projects/my-app

# Or synchronize an existing project
./scripts/sync.sh --target ~/projects/my-app
```

## Create Mode (New Projects)

Create mode copies files from the boilerplate into a new folder, automatically configuring the project.

### Basic Usage

```bash
# Create new project
./scripts/sync.sh --create ~/projects/my-app

# With custom name (different from folder name)
./scripts/sync.sh --create ~/projects/my-app --name "My SaaS App"
```

### Options

```bash
# Without npm install (for CI/CD or manual configuration)
./scripts/sync.sh --create ~/projects/my-app --no-install

# Without git init
./scripts/sync.sh --create ~/projects/my-app --no-git

# Combination
./scripts/sync.sh --create ~/projects/my-app --name "My App" --no-install --no-git
```

### What Create Mode Does

1. **Validation** - Checks if target exists and asks for confirmation if not empty
2. **Copy** - Copies files from boilerplate (excludes `.git`, `node_modules`, `product/*`, etc.)
3. **Transform**:
   - Updates `package.json` with project name (sanitized for npm)
   - Generates new `README.md` for the project
   - Updates `<title>` in `index.html`
4. **Create empty folders** - `product/`, `src/sections/`, `src/shell/components/` with `.gitkeep`
5. **Git Init** - Initializes repo and creates initial commit
6. **npm Install** - Installs dependencies

### Files Excluded on Create

| Folder/File | Reason |
|-------------|--------|
| `.git/` | New repo is created |
| `node_modules/` | Generated with npm install |
| `product/*` | Project-specific content |
| `product-plan/` | Export output |
| `src/sections/*` | User designs |
| `_documentatie/` | Fork internal documentation |
| `scripts/logs/` | Local logs |
| `VERSION` | Only for sync |
| `FORK_CHANGELOG.md` | Fork-specific |
| `fix-plan.md` | Development tasks |

### Example Output

```
═══════════════════════════════════════════════════════════════
  DESIGN OS - CREATE NEW PROJECT
  Version: 1.0.0
═══════════════════════════════════════════════════════════════

[INFO] Creating project: my-saas-app
[INFO] Location: /Users/user/projects/my-saas-app
[INFO] Copying boilerplate files...
[✓] Copied 127 files (skipped 45)
[INFO] Creating .gitkeep files...
[INFO] Updating package.json...
[✓] Updated package.json (name: "my-saas-app")
[INFO] Updating index.html...
[✓] Updated index.html title
[INFO] Generating README.md...
[✓] Generated README.md
[INFO] Initializing git repository...
[✓] Git repository initialized with initial commit
[INFO] Installing dependencies...
[✓] npm install completed (245 packages)

═══════════════════════════════════════════════════════════════
  ✓ PROJECT CREATED SUCCESSFULLY
═══════════════════════════════════════════════════════════════

  Project: my-saas-app
  Location: /Users/user/projects/my-saas-app

  Next steps:
    cd /Users/user/projects/my-saas-app
    npm run dev

  Start designing:
    /product-vision    - Define your product
    /product-roadmap   - Plan your sections

  Documentation:
    ./docs/getting-started.md
```

## Sync Mode (Existing Projects)

## Usage

### Standard Synchronization

```bash
# Synchronization with automatic backup (default)
./scripts/sync.sh --target ~/projects/my-app

# Synchronization without backup
./scripts/sync.sh --target ~/projects/my-app --no-backup

# Synchronization with diff display
./scripts/sync.sh --target ~/projects/my-app --diff

# Forced synchronization (no prompts for conflicts)
./scripts/sync.sh --target ~/projects/my-app --force

# Synchronization that skips conflicts
./scripts/sync.sh --target ~/projects/my-app --skip-conflicts
```

### Preview (Dry-Run)

```bash
# See what files would be modified
./scripts/sync.sh --target ~/projects/my-app --dry-run

# Dry-run with detailed diffs
./scripts/sync.sh --target ~/projects/my-app --dry-run --diff --verbose
```

### Status

```bash
# Check if project is up-to-date
./scripts/sync.sh --target ~/projects/my-app --status
```

Example output:
```
Target: /Users/user/projects/my-app
Boilerplate version: 1.0.0
Last sync: 2025-12-26T19:43:46Z (from v1.0.0)

Status: UP TO DATE ✓
```

Or if there are changes:
```
Status: OUT OF DATE

Changes pending:
  [NEW]       2 files
  [MODIFIED]  5 files
  [CONFLICT]  1 files
  [UNCHANGED] 82 files
```

### Backup and Restore

```bash
# List available backups
./scripts/sync.sh --target ~/projects/my-app --list-backups

# Restore from specific backup
./scripts/sync.sh --target ~/projects/my-app --restore 2025-12-26-14-30-00
```

### Batch Mode (Multiple Projects)

```bash
# 1. Create the targets.txt file
cp scripts/targets.txt.example scripts/targets.txt

# 2. Edit with your project paths
# Example targets.txt:
# ~/projects/app-1
# ~/projects/app-2
# /Users/user/work/client-project

# 3. Synchronize all projects
./scripts/sync.sh --batch

# Forced batch mode (no prompts)
./scripts/sync.sh --batch --force
```

### Watch Mode (Auto-Sync)

```bash
# Start monitoring for changes
./scripts/sync-watch.sh --target ~/projects/my-app

# Watch with force mode (no prompts on conflicts)
./scripts/sync-watch.sh --target ~/projects/my-app --force

# Stop: Ctrl+C
```

### Cleanup

```bash
# Delete old logs and backups
./scripts/sync.sh --cleanup
```

## Complete Options

### Create Mode

| Option | Description |
|--------|-------------|
| `--create <path>` | Creates a new Design OS project at `<path>` |
| `--name <name>` | Project name (default: folder name) |
| `--no-install` | Don't run `npm install` after copying |
| `--no-git` | Don't initialize git repository |

### Sync Mode

| Option | Description |
|--------|-------------|
| `--target <path>` | Path to destination project (required for sync/status/restore) |
| `--batch` | Synchronize all projects from `targets.txt` |
| `--dry-run` | Simulation without actual changes |
| `--backup` | Create backup before overwrite (default: on) |
| `--no-backup` | Disable backup |
| `--diff` | Display content differences |
| `--restore <id>` | Restore from backup (requires `--target`) |
| `--list-backups` | List available backups (requires `--target`) |
| `--status` | Check if target is up-to-date (no sync) |
| `--force` | Overwrite all conflicts without confirmation |
| `--skip-conflicts` | Skip files with conflicts |
| `--cleanup` | Only clean old files, no sync |
| `--verbose` | Detailed output |
| `--quiet` | Errors only |
| `--help` | Display help |

## Synchronized Files

### Directories (recursive)

```
.claude/commands/design-os/
.claude/skills/frontend-design/
.claude/templates/design-os/
src/components/
src/components/ui/
src/lib/
src/types/
docs/
```

### Individual Files

```
agents.md
CLAUDE.md
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
eslint.config.js
index.html
.gitignore
src/main.tsx
src/index.css
src/vite-env.d.ts
```

### Excluded (Not Synchronized)

```
product/*
product-plan/*
node_modules/*
dist/*
.vite/*
*.log
FORK_CHANGELOG.md
README.md
fix-plan.md
```

## Conflict Management

When a file has been modified locally after the last sync, the script detects a **conflict**.

### Interactive Mode (default)

```
═══════════════════════════════════════════════════════════
  CONFLICT: agents.md
═══════════════════════════════════════════════════════════
  Source (boilerplate): 15.2 KB
  Target (local):       16.1 KB (modified locally)

  Options:
    [o] Overwrite - Use boilerplate version
    [s] Skip      - Keep local version
    [d] Diff      - View differences
    [a] Overwrite All - Overwrite all remaining conflicts
    [n] Skip All  - Keep all local versions

  Choose [o/s/d/a/n]: _
```

### Automatic Mode

```bash
# Overwrite all conflicts
./scripts/sync.sh --target ~/projects/my-app --force

# Keep all local versions
./scripts/sync.sh --target ~/projects/my-app --skip-conflicts
```

## Manifest and Tracking

After each sync, the script creates/updates `.sync-manifest.json` in the target project:

```json
{
  "last_sync": "2025-12-26T19:43:46Z",
  "boilerplate_version": "1.0.0",
  "files": {
    "agents.md": {
      "synced_hash": "a1b2c3d4...",
      "synced_at": "2025-12-26T19:43:46Z",
      "source_size": 15234
    }
  }
}
```

This manifest enables:
- Detection of local modifications (conflicts)
- Up-to-date status verification
- Warnings when boilerplate has been updated

## Log Structure

```
scripts/
├── logs/
│   ├── sync-2025-12-26-14-30-00.log   # Text log
│   ├── sync-2025-12-26-14-30-00.json  # JSON log
│   └── backups/
│       └── 2025-12-26-14-30-00/       # Backup files
│           ├── .backup-info.json
│           └── [backed up files...]
```

Default retention:
- **Logs:** 7 days
- **Backups:** 30 days

## Exit Codes

### Sync Mode

| Code | Meaning |
|------|---------|
| `0` | Success - sync completed without errors |
| `1` | General error / invalid arguments |
| `2` | Target doesn't exist |
| `3` | Target is not a valid Design OS project |
| `4` | Lock file exists (another sync in progress) |
| `5` | Backup error |
| `6` | Copy error |
| `7` | Missing dependency |
| `10` | Batch mode - at least one project failed |

### Create Mode

| Code | Meaning |
|------|---------|
| `0` | Success - project created |
| `1` | General error / invalid arguments |
| `11` | Cancelled by user (existing target) |
| `12` | File copy error |
| `13` | npm install failed (warning, continues) |
| `14` | git init failed (warning, continues) |

## Configuration

Edit `scripts/sync-config.sh` to customize:

```bash
# Directories to synchronize
SYNC_DIRS=(
  ".claude/commands/design-os"
  "src/components"
  # ...
)

# Individual files
SYNC_FILES=(
  "agents.md"
  "package.json"
  # ...
)

# Exclude patterns
EXCLUDE_PATTERNS=(
  "product/*"
  "README.md"
  # ...
)

# Retention
BACKUP_RETENTION_DAYS=30
LOG_RETENTION_DAYS=7
AUTO_CLEANUP=true
```

## Troubleshooting

### Blocked lock file

```bash
# If a previous sync failed and the lock remained:
rm ~/projects/my-app/.sync.lock
```

### Watch mode not working

```bash
# macOS - install fswatch
brew install fswatch

# Linux - install inotify-tools
sudo apt install inotify-tools
```

### Unexpected conflicts

If you see conflicts for files you haven't modified:
1. Check `.sync-manifest.json` in the target
2. Delete the manifest for a fresh sync: `rm ~/projects/my-app/.sync-manifest.json`
3. Run sync with `--force` to reset the state

## Recommended Workflow

1. **First sync** for a new project:
   ```bash
   ./scripts/sync.sh --target ~/projects/new-app --dry-run
   ./scripts/sync.sh --target ~/projects/new-app
   ```

2. **Periodic sync** (check + update):
   ```bash
   ./scripts/sync.sh --target ~/projects/my-app --status
   ./scripts/sync.sh --target ~/projects/my-app --diff
   ```

3. **Active development** (watch mode):
   ```bash
   ./scripts/sync-watch.sh --target ~/projects/my-app --force
   ```

4. **Release** (batch sync all projects):
   ```bash
   ./scripts/sync.sh --batch --dry-run
   ./scripts/sync.sh --batch
   ```
