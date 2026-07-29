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
- `.config/containers/systemd/` — Quadlet unit files so `systemctl --user start open-audit` is all that's needed after initial setup.

See the [Podman setup guide](#podman-quick-start) below.

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

### Start the stack

```bash
# First time — build images and start containers
podman compose up -d --build

# Subsequent starts
podman compose up -d
```

The web UI is available at <http://localhost:8087>.
Default credentials: **admin / password**

### Systemd integration (optional, for auto-start on login)

```bash
bash podman-setup.sh
systemctl --user enable --now open-audit
```

### Stop the stack

```bash
podman compose down
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
