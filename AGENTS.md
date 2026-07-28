# Open-AudIT — Agent Notes

## Project overview

Open-AudIT is a PHP/CodeIgniter 4 network auditing application. It discovers devices on a network, audits their hardware and software, and stores the results in a MariaDB database. The entire stack runs in two containers (web + database).

## Running the app

```shell
./podman-setup.sh          # first-time: build, start, wait for DB, composer install
./podman-setup.sh start    # subsequent starts
./podman-setup.sh stop
./podman-setup.sh shell    # bash inside the web container
```

App is at http://localhost:8087/index.php — default login: `admin` / `password`.

Requires `podman` and `podman-compose` (`pip install podman-compose`). Docker + `docker-compose` also work.

## Running tests

```shell
# Unit tests (no database needed)
cd tests && podman-compose up -d
podman exec -it open-audit-community-test-web composer test:unit

# Integration tests (requires database container)
podman exec -it open-audit-community-test-web composer test:integration

# All PHP tests
podman exec -it open-audit-community-test-web composer test

# Playwright acceptance tests (dev stack must be running)
cd tests/playwright
npm install
npx playwright install chromium
npx playwright test
```

See `tests/TESTING.md` for details.

## Code layout

| Path | Purpose |
|---|---|
| `app/Controllers/` | 50 CodeIgniter controllers (one per resource) |
| `app/Models/` | 100 models (one per resource) |
| `app/Helpers/` | 100 global helper functions |
| `app/Libraries/` | Namespaced libraries: Nmap, Auth, Translation, etc. |
| `app/Services/` | Service layer (AuditService, etc.) |
| `app/Views/` | PHP/HTML templates |
| `public/` | Web root — DocumentRoot in Apache |
| `other/open-audit.sql` | Database schema (loaded on first container start) |
| `.compose/` | Containerfiles, Apache config, PHP ini, Quadlet units |

## Container layout

- **`.compose/web/Containerfile`** — PHP 8.4 + Apache image
- **`.compose/database/Containerfile`** — MariaDB 12.1 image
- **`compose.yml`** — development stack (ports 8087:80, 33067:3306)
- **`tests/compose.yml`** — test stack (separate containers, ports 8088, 33097)
- **`.compose/quadlets/`** — systemd Quadlet units for production (no podman-compose needed)

## Key things to know

- **Apache `/icons/` alias**: the base `php:apache` image ships an `Alias /icons/` pointing to Apache's own FancyIndex icons. The Containerfile removes it so the app's `public/icons/` SVGs are served correctly.
- **`AllowOverride None`**: `.htaccess` is not read; URLs must include `index.php` (e.g. `/index.php/devices`). mod_rewrite is not enabled in the container.
- **Volume mount**: the project root is bind-mounted into the container at `/usr/local/open-audit`. Edits on the host are live immediately — no rebuild needed for PHP/view changes.
- **Database credentials**: hardcoded defaults are `openaudit`/`openauditpassword` (dev only). Change via environment variables in `compose.yml`.
- **Composer**: dependencies are not committed. Run `composer install` inside the web container after first start (`./podman-setup.sh` does this automatically).

## Test coverage notes

Tests live in `tests/Unit/` and `tests/Integration/`. The Nmap library and security helper have solid coverage. Models, controllers, and most helpers have none. The integration test (`ExampleDatabaseTest`) is a scaffold — it tests CodeIgniter infrastructure, not app behaviour.

Coverage source is commented out in `phpunit.xml.dist` — uncomment the `<source>` block to get real coverage numbers.
