#!/bin/bash

# CONFIGURATION
INTERVAL=30 # Revisa cada 30 segundos
BRANCH="main"
BACKUP_DIR="./backups"

mkdir -p "$BACKUP_DIR"

echo "🛡️  Git & Snapshot Auto-Sync Active..."
echo "Snapshot folder: $BACKUP_DIR"
echo "GitHub Repo: origin/$BRANCH"
echo "Press [CTRL+C] to stop."

while true; do
  if [[ -n $(git status --porcelain) ]]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    DATE_HUMAN=$(date +"%Y-%m-%d %H:%M:%S")
    
    echo "📦 Changes found ($DATE_HUMAN). Creating backup..."
    
    # 1. Local Snapshot (Physical copy of key files)
    SNAPSHOT_FOLDER="$BACKUP_DIR/snapshot_$TIMESTAMP"
    mkdir -p "$SNAPSHOT_FOLDER"
    cp index.html "$SNAPSHOT_FOLDER/" 2>/dev/null
    cp style.css "$SNAPSHOT_FOLDER/" 2>/dev/null
    cp main.js "$SNAPSHOT_FOLDER/" 2>/dev/null
    cp -r pages "$SNAPSHOT_FOLDER/" 2>/dev/null
    
    # 2. Git Sync (Cloud Backup)
    git add .
    git commit -m "auto-sync: $DATE_HUMAN"
    git push origin $BRANCH
    
    echo "✅ Backup and Sync complete."
  fi
  sleep $INTERVAL
done
