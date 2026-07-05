#!/usr/bin/env bash
set -e

echo "Setting up development environment..."
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
echo "Setup complete! Run 'npm run dev' to start."
