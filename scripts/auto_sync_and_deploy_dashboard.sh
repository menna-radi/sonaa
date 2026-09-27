#!/usr/bin/env bash
set -eo pipefail

DASHBOARD_DIR="/home/mrx77/projects_work/sonaa-dashboard/sonaa"
SERVER_IP="179.198.194.152"
SSH_KEY="/home/mrx77/.ssh/id_ed25519_hostinger_nopass"
REMOTE_DASHBOARD_DIR="/var/www/sonaa/dashboard"
SCRATCH_DIR="/home/mrx77/.gemini/antigravity-cli/brain/919c4da2-52ae-4e46-8a27-59ba6b1df2f6/scratch"
mkdir -p "$SCRATCH_DIR"
LOG_FILE="$SCRATCH_DIR/auto_sync_dashboard.log"

log() {
  local timestamp
  timestamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "[$timestamp] $*" | tee -a "$LOG_FILE"
}

notify_telegram() {
  local msg="$1"
  if [ -x "/home/mrx77/.local/bin/hermes" ]; then
    /home/mrx77/.local/bin/hermes send --to telegram "$msg" >/dev/null 2>&1 || true
  fi
}

cd "$DASHBOARD_DIR"

log "Checking dashboard origin/main for remote updates..."
git fetch origin main -q

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  log "No new dashboard changes detected. Local ($LOCAL_COMMIT) is up to date with origin/main."
  exit 0
fi

COMMIT_MSG=$(git log -1 --pretty=format:"%s (%an)" origin/main)
log "New dashboard commit detected: $REMOTE_COMMIT - $COMMIT_MSG"
log "Pulling changes into local workspace..."
git pull origin main

log "Running local dashboard build verification..."
npm run build

log "Deploying dashboard to production server ($SERVER_IP)..."
ssh -n -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=15 -i "$SSH_KEY" root@"$SERVER_IP" "bash -c '
  set -eo pipefail
  cd $REMOTE_DASHBOARD_DIR
  git pull origin main
  npm run build
'"

log "Verifying live dashboard endpoint..."
HTTP_STATUS=$(curl -sI -o /dev/null -w "%{http_code}" --max-time 10 https://dash.arox.digital || echo "FAILED")

if [ "$HTTP_STATUS" = "200" ]; then
  log "SUCCESS: Dashboard deployment verified healthy (HTTP 200)!"
  notify_telegram "🚀 [Sonaa Dashboard Auto-Deploy]
Commit: $REMOTE_COMMIT
Message: $COMMIT_MSG
Status: Built & Live at dash.arox.digital ✅"
else
  log "WARNING: Dashboard HTTP check returned $HTTP_STATUS!"
  notify_telegram "⚠️ [Sonaa Dashboard Auto-Deploy Warning]
Commit: $REMOTE_COMMIT
HTTP Status: $HTTP_STATUS"
fi
