#!/bin/bash

# Tool to list and restore previous versions
BACKUP_DIR="./backups"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ No backup folder found."
    exit 1
fi

echo "🕰️  Available Backups:"
ls -1 "$BACKUP_DIR" | nl

echo ""
echo "Select the number of the version you want to restore (or 'q' to quit):"
read -r choice

if [[ "$choice" =~ ^[0-9]+$ ]]; then
    FOLDER=$(ls -1 "$BACKUP_DIR" | sed -n "${choice}p")
    if [ -n "$FOLDER" ]; then
        echo "🔄 Restoring files from $FOLDER..."
        cp "$BACKUP_DIR/$FOLDER/index.html" . 2>/dev/null
        cp "$BACKUP_DIR/$FOLDER/style.css" . 2>/dev/null
        cp "$BACKUP_DIR/$FOLDER/main.js" . 2>/dev/null
        cp -r "$BACKUP_DIR/$FOLDER/pages" . 2>/dev/null
        echo "✨ Done! Refresh your browser to see the changes."
    else
        echo "❌ Invalid selection."
    fi
fi
