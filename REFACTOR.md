# Open-AudIT — Refactor Fork

This is the **Refactor** fork of [FirstWave Open-AudIT](https://github.com/firstwave/open-audit), developed by **Steve Dalton** and **Regan Russell**.

The fork focuses on two things the upstream project doesn't yet prioritise:

1. **Easy, reproducible installation using Podman** — no Docker daemon required, rootless containers, and Quadlet-based systemd integration so the stack starts automatically on boot.
2. **Quality and automated testing** — a growing suite of PHPUnit unit/integration tests and Playwright end-to-end acceptance tests that run against a real database, so regressions are caught before they ship.

---

## What's different from upstream

### Podman-first container setup

- `compose.yml` — standard Compose file that works with `podman compose` as well as Docker Compose.
- `podman-setup.sh` — one-shot script that installs and configures the full stack (database + web) as rootless Podman containers managed by systemd.
- `.compose/quadlets/` — Quadlet unit files for systemd-native deployment (no `podman-compose` at runtime).

See the [Podman quick start](#podman-quick-start) and [systemd / Quadlets](#systemd--quadlets) sections below.

### Automated testing

| Layer | Tool | Location |
|---|---|---|
| Unit & integration | PHPUnit | `tests/` |
| End-to-end (browser) | Playwright | `tests/playwright/` |

The Playwright suite covers login/logout, navigation, summaries, devices, groups, users, and the about page. Tests run against the real application stack (no mocking of the database or HTTP layer).

To run the Playwright suite:

```bash
cd tests/playwright
npx playwright test
```

> The application stack must be running first — see Podman Quick Start below.

---

## Podman Quick Start

### Prerequisites

- Podman ≥ 4.4 and `podman-compose` (or Docker Compose v2)
- Linux (tested on Ubuntu 22.04+) or WSL2

### 1. Clone and run the setup script

The script sets directory permissions, builds images, starts the containers, waits for the database, and installs Composer dependencies in one step.

```bash
git clone git@github.com:refactorau/open-audit.git open-audit
cd open-audit
chmod +x ./podman-setup.sh
./podman-setup.sh
```

The web UI is then available at <http://localhost:8087/index.php>.
Default credentials: **admin / password**

### Additional commands

```bash
./podman-setup.sh start   # start already-built containers
./podman-setup.sh stop    # stop and remove containers
./podman-setup.sh logs    # tail logs from all containers
./podman-setup.sh shell   # open a bash shell in the web container
```

> Docker users can substitute `docker-compose` for `podman-compose` — the `compose.yml` is compatible with both.

### Optional: Xdebug

Create a custom PHP INI file before running the setup script:

```bash
cat > ./.compose/web/php/ini/development.ini << EOF
zend_extension=xdebug.so
xdebug.mode=debug,coverage
xdebug.client_host=host.containers.internal
xdebug.client_port=9003
xdebug.idekey=PHPSTORM
EOF
```

---

## Systemd / Quadlets

Quadlets are Podman's native systemd integration (Podman ≥ 4.4). No `podman-compose` is needed at runtime; systemd manages container lifecycle, restart on failure, and boot start.

### 1. Build the images and install dependencies

```bash
./podman-setup.sh
./podman-setup.sh stop    # stop compose-managed containers before handing off to systemd
```

### 2. Edit the web container unit

Open `.compose/quadlets/open-audit-web.container` and replace `/path/to/open-audit` with the absolute path to your clone:

```ini
Volume=/home/youruser/open-audit:/usr/local/open-audit:rw,z
```

### 3. Install the Quadlet files

**Rootless (recommended):**

```bash
mkdir -p ~/.config/containers/systemd
cp .compose/quadlets/* ~/.config/containers/systemd/
systemctl --user daemon-reload
```

**Root:**

```bash
cp .compose/quadlets/* /etc/containers/systemd/
systemctl daemon-reload
```

### 4. Start the services

```bash
# Rootless
systemctl --user start open-audit-web.service

# Root
systemctl start open-audit-web.service
```

`open-audit-database.service` starts automatically as a dependency.

### 5. Enable on boot (optional)

```bash
# Rootless — also enable lingering so services start before login
systemctl --user enable open-audit-web.service
loginctl enable-linger "$USER"

# Root
systemctl enable open-audit-web.service
```

### Useful systemd commands

```bash
systemctl --user status open-audit-web.service
journalctl --user -u open-audit-web.service -f
systemctl --user stop open-audit-web.service
```

---

## Bug fixes included in this fork

- **Apache `/icons/` alias** — upstream's `default.conf` was missing an `Alias` directive, so Apache's built-in `/icons/` alias (used for directory listing icons) intercepted requests meant for the application's own icon set, producing 404s on the summaries page. Fixed by adding an explicit `Alias /icons/` override in the VirtualHost config.

---

## Contributing

This fork is maintained by Steve Dalton and Regan Russell.

- [refactor.com.au](https://refactor.com.au)
- [refactor.red](https://refactor.red)

Pull requests and issues are welcome. Upstream improvements are periodically merged from [FirstWave Open-AudIT](https://github.com/firstwave/open-audit).
