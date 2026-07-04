#!/usr/bin/env bash
set -e

usage() {
  echo "Usage: $0 --name NAME --email EMAIL --password PASSWORD --profile student|coach|admin"
  exit 1
}

NAME=""
EMAIL=""
PASSWORD=""
PROFILE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --name) NAME="$2"; shift 2 ;;
    --email) EMAIL="$2"; shift 2 ;;
    --password) PASSWORD="$2"; shift 2 ;;
    --profile) PROFILE="$2"; shift 2 ;;
    *) usage ;;
  esac
done

[[ -z "$NAME" || -z "$EMAIL" || -z "$PASSWORD" || -z "$PROFILE" ]] && usage

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('$PASSWORD', 12);
  const profile = await prisma.profile.findUnique({ where: { name: '$PROFILE' } });
  if (!profile) { console.error('Profile not found: $PROFILE'); process.exit(1); }
  const user = await prisma.user.create({
    data: {
      name: '$NAME',
      email: '$EMAIL',
      hashedPassword: hash,
      userProfile: { create: { profileId: profile.id } }
    }
  });
  console.log('Created user:', user.id);
  await prisma.\$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
"
