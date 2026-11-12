#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/yangyang-cms}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/nocobase-${TIMESTAMP}.sql.gz"
TEMP_FILE="${BACKUP_FILE}.tmp"
TEMP_SQL="${BACKUP_DIR}/.nocobase-${TIMESTAMP}.sql.tmp"

mkdir -p "$BACKUP_DIR"
umask 077

cleanup() {
  rm -f "$TEMP_FILE" "$TEMP_SQL"
}
trap cleanup EXIT HUP INT TERM

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T nocobase-mysql \
  sh -c 'exec mysqldump --single-transaction --quick --routines --triggers --no-tablespaces -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > "$TEMP_SQL"

[ -s "$TEMP_SQL" ]
gzip -9 -c "$TEMP_SQL" > "$TEMP_FILE"
gzip -t "$TEMP_FILE"
mv "$TEMP_FILE" "$BACKUP_FILE"
find "$BACKUP_DIR" -type f -name 'nocobase-*.sql.gz' -mtime "+$RETENTION_DAYS" -delete

printf 'Backup created: %s\n' "$BACKUP_FILE"
