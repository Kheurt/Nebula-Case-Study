#!/usr/bin/env bash
# deploy.sh — Production deployment script (example for single-server deploy)
set -euo pipefail

echo "=== Nebula Job Immersion Platform — Deploy ==="

# 1. Install dependencies
echo "[1/5] Installing dependencies..."
npm ci --production=false

# 2. Build Next.js
echo "[2/5] Building application..."
npm run build

# 3. Run migrations
echo "[3/5] Running database migrations..."
npx prisma migrate deploy

# 4. Generate Prisma client
echo "[4/5] Generating Prisma client..."
npx prisma generate

# 5. Start server (or restart pm2/systemd)
echo "[5/5] Starting server..."
if command -v pm2 &>/dev/null; then
  pm2 restart nebula-platform || pm2 start npm --name "nebula-platform" -- start
else
  echo "pm2 not found. Start manually with: npm start"
fi

echo "=== Deploy complete ==="
