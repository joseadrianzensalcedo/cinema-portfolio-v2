#!/bin/bash

# CONFIGURATION
INTERVAL=60 # Seconds between checks
BRANCH="main"

echo "🚀 Git Auto-Sync Starter..."
echo "Press [CTRL+C] to stop syncing."

while true; do
  # Check if there are any changes (modified, deleted, untracked)
  if [[ -n $(git status --porcelain) ]]; then
    echo "📦 Changes detected! Syncing to GitHub..."
    
    # Add all changes
    git add .
    
    # Commit with a timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    git commit -m "auto-sync: $TIMESTAMP"
    
    # Push to origin
    git push origin $BRANCH
    
    echo "✅ Success! Sleeping for $INTERVAL seconds."
  fi
  
  sleep $INTERVAL
done
