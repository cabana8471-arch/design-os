# Design OS Boilerplate Sync

Script de sincronizare pentru menținerea proiectelor Design OS la zi cu boilerplate-ul și pentru crearea de proiecte noi.

## Funcționalități

- **Create Mode** - Creează proiecte noi din boilerplate
- **Sync Mode** - Sincronizează proiecte existente cu actualizările din boilerplate
- **Batch Mode** - Sincronizează multiple proiecte simultan
- **Backup & Restore** - Backup automat înainte de modificări

## Cerințe

- **Bash 3.2+** (macOS) sau **Bash 4.0+** (Linux)
- **diff** (inclus în sistem)
- **jq** (opțional, pentru formatare JSON)
- **fswatch** (opțional, pentru watch mode pe macOS)
- **inotify-tools** (opțional, pentru watch mode pe Linux)

Instalare dependențe opționale:
```bash
# macOS
brew install jq fswatch

# Ubuntu/Debian
sudo apt install jq inotify-tools

# Fedora
sudo dnf install jq inotify-tools
```

## Început Rapid

```bash
# Creează un proiect nou
./scripts/sync.sh --create ~/projects/my-app

# Sau sincronizează un proiect existent
./scripts/sync.sh --target ~/projects/my-app
```

## Create Mode (Proiecte Noi)

Create mode copiază fișierele din boilerplate într-un folder nou, configurând automat proiectul.

### Utilizare de Bază

```bash
# Creează proiect nou
./scripts/sync.sh --create ~/projects/my-app

# Cu nume personalizat (diferit de numele folderului)
./scripts/sync.sh --create ~/projects/my-app --name "My SaaS App"
```

### Opțiuni

```bash
# Fără npm install (pentru CI/CD sau configurare manuală)
./scripts/sync.sh --create ~/projects/my-app --no-install

# Fără git init
./scripts/sync.sh --create ~/projects/my-app --no-git

# Combinație
./scripts/sync.sh --create ~/projects/my-app --name "My App" --no-install --no-git
```

### Ce face Create Mode

1. **Validare** - Verifică dacă target-ul există și cere confirmare dacă nu e gol
2. **Copiere** - Copiază fișierele din boilerplate (exclude `.git`, `node_modules`, `product/*`, etc.)
3. **Transformare**:
   - Actualizează `package.json` cu numele proiectului (sanitizat pentru npm)
   - Generează `README.md` nou pentru proiect
   - Actualizează `<title>` în `index.html`
4. **Creare folder-e goale** - `product/`, `src/sections/`, `src/shell/components/` cu `.gitkeep`
5. **Git Init** - Inițializează repo și creează commit inițial
6. **npm Install** - Instalează dependențele

### Fișiere Excluse la Create

| Folder/Fișier | Motiv |
|---------------|-------|
| `.git/` | Se creează repo nou |
| `node_modules/` | Se generează cu npm install |
| `product/*` | Conținut specific proiectului |
| `product-plan/` | Export output |
| `src/sections/*` | Design-uri de utilizator |
| `_documentatie/` | Documentație internă fork |
| `scripts/logs/` | Log-uri locale |
| `VERSION` | Doar pentru sync |
| `FORK_CHANGELOG.md` | Specific fork-ului |
| `fix-plan.md` | Task-uri de dezvoltare |

### Output Exemplu

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

## Sync Mode (Proiecte Existente)

## Utilizare

### Sincronizare Standard

```bash
# Sincronizare cu backup automat (implicit)
./scripts/sync.sh --target ~/projects/my-app

# Sincronizare fără backup
./scripts/sync.sh --target ~/projects/my-app --no-backup

# Sincronizare cu afișare diferențe
./scripts/sync.sh --target ~/projects/my-app --diff

# Sincronizare forțată (fără prompturi pentru conflicte)
./scripts/sync.sh --target ~/projects/my-app --force

# Sincronizare care sare peste conflicte
./scripts/sync.sh --target ~/projects/my-app --skip-conflicts
```

### Preview (Dry-Run)

```bash
# Vezi ce fișiere ar fi modificate
./scripts/sync.sh --target ~/projects/my-app --dry-run

# Dry-run cu diferențe detaliate
./scripts/sync.sh --target ~/projects/my-app --dry-run --diff --verbose
```

### Status

```bash
# Verifică dacă proiectul e la zi
./scripts/sync.sh --target ~/projects/my-app --status
```

Output exemplu:
```
Target: /Users/user/projects/my-app
Boilerplate version: 1.0.0
Last sync: 2025-12-26T19:43:46Z (from v1.0.0)

Status: UP TO DATE ✓
```

Sau dacă sunt modificări:
```
Status: OUT OF DATE

Changes pending:
  [NEW]       2 files
  [MODIFIED]  5 files
  [CONFLICT]  1 files
  [UNCHANGED] 82 files
```

### Backup și Restore

```bash
# Listează backup-urile disponibile
./scripts/sync.sh --target ~/projects/my-app --list-backups

# Restaurează din backup specific
./scripts/sync.sh --target ~/projects/my-app --restore 2025-12-26-14-30-00
```

### Batch Mode (Mai Multe Proiecte)

```bash
# 1. Creează fișierul targets.txt
cp scripts/targets.txt.example scripts/targets.txt

# 2. Editează cu căile proiectelor tale
# Exemplu targets.txt:
# ~/projects/app-1
# ~/projects/app-2
# /Users/user/work/client-project

# 3. Sincronizează toate proiectele
./scripts/sync.sh --batch

# Batch mode forțat (fără prompturi)
./scripts/sync.sh --batch --force
```

### Watch Mode (Auto-Sync)

```bash
# Pornește monitorizarea modificărilor
./scripts/sync-watch.sh --target ~/projects/my-app

# Watch cu force mode (fără prompturi la conflicte)
./scripts/sync-watch.sh --target ~/projects/my-app --force

# Oprire: Ctrl+C
```

### Curățare

```bash
# Șterge log-uri și backup-uri vechi
./scripts/sync.sh --cleanup
```

## Opțiuni Complete

### Create Mode

| Opțiune | Descriere |
|---------|-----------|
| `--create <path>` | Creează un proiect Design OS nou la `<path>` |
| `--name <name>` | Numele proiectului (implicit: numele folderului) |
| `--no-install` | Nu rula `npm install` după copiere |
| `--no-git` | Nu inițializa repository git |

### Sync Mode

| Opțiune | Descriere |
|---------|-----------|
| `--target <path>` | Calea către proiectul destinație (obligatoriu pentru sync/status/restore) |
| `--batch` | Sincronizează toate proiectele din `targets.txt` |
| `--dry-run` | Simulare fără modificări efective |
| `--backup` | Crează backup înainte de overwrite (implicit: on) |
| `--no-backup` | Dezactivează backup-ul |
| `--diff` | Afișează diferențele în conținut |
| `--restore <id>` | Restaurează din backup (necesită `--target`) |
| `--list-backups` | Listează backup-urile disponibile (necesită `--target`) |
| `--status` | Verifică dacă target-ul e la zi (fără sync) |
| `--force` | Suprascrie toate conflictele fără confirmare |
| `--skip-conflicts` | Sare peste fișiere cu conflicte |
| `--cleanup` | Doar curățare fișiere vechi, fără sync |
| `--verbose` | Output detaliat |
| `--quiet` | Doar erori |
| `--help` | Afișează ajutor |

## Fișiere Sincronizate

### Directoare (recursive)

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

### Fișiere Individuale

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

### Excluse (Nu se sincronizează)

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

## Gestionare Conflicte

Când un fișier a fost modificat local după ultimul sync, scriptul detectează un **conflict**.

### Mod Interactiv (implicit)

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

### Mod Automat

```bash
# Suprascrie toate conflictele
./scripts/sync.sh --target ~/projects/my-app --force

# Păstrează toate versiunile locale
./scripts/sync.sh --target ~/projects/my-app --skip-conflicts
```

## Manifest și Tracking

După fiecare sync, scriptul creează/actualizează `.sync-manifest.json` în proiectul target:

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

Acest manifest permite:
- Detectarea modificărilor locale (conflicte)
- Verificarea statusului up-to-date
- Avertismente când boilerplate-ul a fost actualizat

## Structura Log-urilor

```
scripts/
├── logs/
│   ├── sync-2025-12-26-14-30-00.log   # Log text
│   ├── sync-2025-12-26-14-30-00.json  # Log JSON
│   └── backups/
│       └── 2025-12-26-14-30-00/       # Backup files
│           ├── .backup-info.json
│           └── [backed up files...]
```

Retenție implicită:
- **Log-uri:** 7 zile
- **Backup-uri:** 30 zile

## Coduri de Ieșire

### Sync Mode

| Cod | Semnificație |
|-----|--------------|
| `0` | Success - sync complet fără erori |
| `1` | Eroare generală / argumente invalide |
| `2` | Target-ul nu există |
| `3` | Target-ul nu e un proiect Design OS valid |
| `4` | Lock file există (alt sync în progress) |
| `5` | Eroare de backup |
| `6` | Eroare de copiere |
| `7` | Dependență lipsă |
| `10` | Batch mode - cel puțin un proiect a eșuat |

### Create Mode

| Cod | Semnificație |
|-----|--------------|
| `0` | Success - proiect creat |
| `1` | Eroare generală / argumente invalide |
| `11` | Anulat de utilizator (target existent) |
| `12` | Eroare la copiere fișiere |
| `13` | npm install a eșuat (warning, continuă) |
| `14` | git init a eșuat (warning, continuă) |

## Configurare

Editează `scripts/sync-config.sh` pentru a personaliza:

```bash
# Directoare de sincronizat
SYNC_DIRS=(
  ".claude/commands/design-os"
  "src/components"
  # ...
)

# Fișiere individuale
SYNC_FILES=(
  "agents.md"
  "package.json"
  # ...
)

# Patterns de exclus
EXCLUDE_PATTERNS=(
  "product/*"
  "README.md"
  # ...
)

# Retenție
BACKUP_RETENTION_DAYS=30
LOG_RETENTION_DAYS=7
AUTO_CLEANUP=true
```

## Troubleshooting

### Lock file blocat

```bash
# Dacă un sync anterior a eșuat și lock-ul a rămas:
rm ~/projects/my-app/.sync.lock
```

### Watch mode nu funcționează

```bash
# macOS - instalează fswatch
brew install fswatch

# Linux - instalează inotify-tools
sudo apt install inotify-tools
```

### Conflicte neașteptate

Dacă vezi conflicte pentru fișiere pe care nu le-ai modificat:
1. Verifică `.sync-manifest.json` din target
2. Șterge manifestul pentru un sync fresh: `rm ~/projects/my-app/.sync-manifest.json`
3. Rulează sync cu `--force` pentru a reseta starea

## Workflow Recomandat

1. **Primul sync** pentru un proiect nou:
   ```bash
   ./scripts/sync.sh --target ~/projects/new-app --dry-run
   ./scripts/sync.sh --target ~/projects/new-app
   ```

2. **Sync periodic** (verificare + update):
   ```bash
   ./scripts/sync.sh --target ~/projects/my-app --status
   ./scripts/sync.sh --target ~/projects/my-app --diff
   ```

3. **Dezvoltare activă** (watch mode):
   ```bash
   ./scripts/sync-watch.sh --target ~/projects/my-app --force
   ```

4. **Release** (batch sync toate proiectele):
   ```bash
   ./scripts/sync.sh --batch --dry-run
   ./scripts/sync.sh --batch
   ```
