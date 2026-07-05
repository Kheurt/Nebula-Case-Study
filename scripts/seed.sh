#!/usr/bin/env bash
set -e
echo "Seeding database..."
npm run db:seed
echo "Done."
