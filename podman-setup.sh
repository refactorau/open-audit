#!/usr/bin/env bash
# Manage Open-AudIT using Podman.

set -euo pipefail

cd "$(dirname "$0")"

COMPOSE_FILE="compose.yml"
WEB_CONTAINER="open-audit-community-web"
DB_CONTAINER="open-audit-community-database"
DB_USER="openaudit"
DB_PASS="openauditpassword"

log() { printf '\033[0;32m[open-audit]\033[0m %s\n' "$*"; }
die() { printf '\033[0;31m[open-audit] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

need() {
    command -v "$1" >/dev/null 2>&1 || die "$1 is required but not installed. $2"
}

set_permissions() {
    log "Setting directory permissions..."
    chmod 0777 app/Attachments other/scripts public/custom_images writable
    find writable -type d -exec chmod 0777 {} \;
}

wait_for_db() {
    log "Waiting for database to be ready..."
    local attempts=30
    for i in $(seq 1 "$attempts"); do
        if podman exec "$DB_CONTAINER" \
               mariadb-admin --user="$DB_USER" --password="$DB_PASS" ping --silent 2>/dev/null; then
            log "Database is ready."
            return 0
        fi
        [ "$i" -lt "$attempts" ] \
            || die "Database did not become ready. Check: podman logs $DB_CONTAINER"
        sleep 2
    done
}

cmd_setup() {
    need podman        "See https://podman.io/docs/installation"
    need podman-compose "Install with: pip install podman-compose"

    set_permissions

    log "Building images..."
    podman-compose -f "$COMPOSE_FILE" build

    log "Starting containers..."
    podman-compose -f "$COMPOSE_FILE" up -d

    wait_for_db

    log "Installing Composer dependencies..."
    podman exec "$WEB_CONTAINER" composer install --no-interaction

    log ""
    log "Open-AudIT is running."
    log "  Web UI:   http://localhost:8087/index.php"
    log "  Database: localhost:33067"
    log ""
    log "Useful commands:"
    log "  ./podman-setup.sh stop   — stop containers"
    log "  ./podman-setup.sh logs   — tail logs"
    log "  ./podman-setup.sh shell  — shell in web container"
}

cmd_start() {
    need podman        "See https://podman.io/docs/installation"
    need podman-compose "Install with: pip install podman-compose"

    log "Starting containers..."
    podman-compose -f "$COMPOSE_FILE" up -d
    wait_for_db
    log "Open-AudIT is running at http://localhost:8087/index.php"
}

cmd_stop() {
    need podman-compose "Install with: pip install podman-compose"
    log "Stopping containers..."
    podman-compose -f "$COMPOSE_FILE" down
}

cmd_logs() {
    need podman-compose "Install with: pip install podman-compose"
    podman-compose -f "$COMPOSE_FILE" logs -f
}

cmd_shell() {
    need podman "See https://podman.io/docs/installation"
    podman exec -it "$WEB_CONTAINER" bash
}

usage() {
    cat <<EOF
Usage: $(basename "$0") [COMMAND]

Commands:
  setup   (default) First-time: build images, start containers, install Composer deps
  start   Start already-built containers
  stop    Stop and remove containers
  logs    Tail container logs
  shell   Open a bash shell in the web container
  help    Show this message

EOF
}

case "${1:-setup}" in
    setup)           cmd_setup  ;;
    start)           cmd_start  ;;
    stop)            cmd_stop   ;;
    logs)            cmd_logs   ;;
    shell)           cmd_shell  ;;
    -h|--help|help)  usage      ;;
    *) usage; die "Unknown command: ${1}" ;;
esac
