#!/bin/sh
set -e

echo "[entrypoint] applying migrations"
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] seeding database"
node dist/prisma/seed.js

echo "[entrypoint] starting API"
exec node dist/src/main.js
