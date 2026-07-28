## Container Installation

Two approaches are documented here:

- **[Quick start (podman-compose)](#quick-start-podman-compose)** — development and local use
- **[Systemd / Quadlets](#systemd--quadlets)** — production, runs as a systemd service without `podman-compose`

> Docker user? Substitute `podman-compose` with `docker-compose` and `podman` with `docker` throughout.

---

## Quick start (podman-compose)

#### 1. Clone the project

```shell
git clone git@github.com:Opmantek/open-audit.git open-audit
cd open-audit
```

#### 2. Run the setup script

The script sets directory permissions, builds images, starts the containers, waits for the database, and installs Composer dependencies in one step.

```shell
chmod +x ./podman-setup.sh
./podman-setup.sh
```

Open-AudIT is then available at **http://localhost:8087/index.php**.

#### Additional commands

```shell
./podman-setup.sh start   # start already-built containers
./podman-setup.sh stop    # stop and remove containers
./podman-setup.sh logs    # tail logs from all containers
./podman-setup.sh shell   # open a bash shell in the web container
```

#### Optional: Xdebug

Create a custom PHP INI file before running the setup script:

```shell
cat > ./.compose/web/php/ini/development.ini << EOF
error_reporting=E_ALL & ~E_DEPRECATED
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

### Prerequisites

- Podman ≥ 4.4
- Images already built (run `podman-compose build` or `./podman-setup.sh` once to build them)

### 1. Clone the project

```shell
git clone git@github.com:Opmantek/open-audit.git open-audit
cd open-audit
```

### 2. Set directory permissions

```shell
chmod 0777 ./app/Attachments ./other/scripts ./public/custom_images ./writable
find ./writable -type d -exec chmod 0777 {} \;
```

### 3. Build the images

```shell
podman-compose build
```

### 4. Install Composer dependencies (first run only)

```shell
./podman-setup.sh       # or run composer install manually inside the web container
./podman-setup.sh stop  # stop compose-managed containers before handing off to systemd
```

### 5. Edit the web container unit

Open `.compose/quadlets/open-audit-web.container` and replace `/path/to/open-audit` with the absolute path to your clone:

```ini
Volume=/home/youruser/open-audit:/usr/local/open-audit:rw,z
```

### 6. Install the Quadlet files

**Rootless (recommended):**

```shell
mkdir -p ~/.config/containers/systemd
cp .compose/quadlets/* ~/.config/containers/systemd/
systemctl --user daemon-reload
```

**Root:**

```shell
cp .compose/quadlets/* /etc/containers/systemd/
systemctl daemon-reload
```

### 7. Start the services

```shell
# Rootless
systemctl --user start open-audit-web.service

# Root
systemctl start open-audit-web.service
```

`open-audit-database.service` starts automatically as a dependency.

### 8. Enable on boot (optional)

```shell
# Rootless — also enable lingering so services start before login
systemctl --user enable open-audit-web.service
loginctl enable-linger "$USER"

# Root
systemctl enable open-audit-web.service
```

### 9. Useful systemd commands

```shell
# Status
systemctl --user status open-audit-web.service
systemctl --user status open-audit-database.service

# Logs
journalctl --user -u open-audit-web.service -f
journalctl --user -u open-audit-database.service -f

# Stop
systemctl --user stop open-audit-web.service
```

Open-AudIT is available at **http://localhost:8087/index.php**.
