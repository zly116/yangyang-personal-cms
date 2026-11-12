#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  printf 'Usage: %s /path/to/nocobase-backup.sql.gz\n' "$0" >&2
  exit 2
fi

BACKUP_FILE="$1"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env}"
VERIFY_DB="nocobase_restore_verify_$(date +%Y%m%d%H%M%S)"

if [ ! -f "$BACKUP_FILE" ]; then
  printf 'Backup not found: %s\n' "$BACKUP_FILE" >&2
  exit 2
fi

case "$VERIFY_DB" in
  nocobase_restore_verify_[0-9]*) ;;
  *) printf 'Unsafe verification database name\n' >&2; exit 2 ;;
esac

mysql_root() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T nocobase-mysql \
    sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$@"' sh "$@"
}

cleanup() {
  mysql_root -e "DROP DATABASE IF EXISTS \`$VERIFY_DB\`;" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM

gzip -t "$BACKUP_FILE"
mysql_root -e "CREATE DATABASE \`$VERIFY_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
gzip -dc "$BACKUP_FILE" | mysql_root "$VERIFY_DB"

TABLE_COUNT="$(mysql_root -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$VERIFY_DB';")"
if [ "$TABLE_COUNT" -le 0 ]; then
  printf 'Restore verification failed: no tables restored.\n' >&2
  exit 1
fi

printf 'Restore verification passed: %s tables restored into temporary database %s.\n' "$TABLE_COUNT" "$VERIFY_DB"
