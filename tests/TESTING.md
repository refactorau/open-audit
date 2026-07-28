## Container Installation

> Docker user? No problem - Substitute `podman-compose` with `docker-compose`

#### 1. Change directory

> All further steps are to be carried out within the `open-audit/tests` directory

```shell
cd tests
```

#### 2. Bring up the containers

```shell
podman-compose up -d
```

#### 3. Execute tests

```shell
podman exec -it open-audit-community-test-web sh -c "composer test"
```

#### 4. Bring down the containers

```shell
podman-compose down
```

---

## Playwright acceptance tests

Playwright tests live in `tests/playwright/` and run against the full web stack. They require Node.js ≥ 18 and Playwright browsers installed.

### From the host (against the dev stack)

The dev stack (`./podman-setup.sh` in the project root) must be running first.

```shell
cd tests/playwright
npm install
npx playwright install chromium
npx playwright test
```

The app is expected at `http://localhost:8087`. Override with `BASE_URL`:

```shell
BASE_URL=http://localhost:8087 npx playwright test
```

View the HTML report after a run:

```shell
npm run report
```

### Via the test compose stack

The `playwright` service is gated behind the `playwright` profile so it does not start with a plain `podman-compose up`.

```shell
cd tests
podman-compose up -d                               # start web + database
podman-compose --profile playwright run playwright # run Playwright once, then exit
```

The Playwright container resolves the web service as `http://web` via the shared `open-audit-community-test` network.

### What is tested

| File | Tests |
|---|---|
| `tests/logon.spec.js` | Login form visible; redirect to logon when unauthenticated; valid/invalid credentials |
| `tests/summaries.spec.js` | Page loads; all `/icons/*.svg` return 200 (regression for Apache alias bug); Devices tile visible |
| `tests/nav.spec.js` | Four navbar menus visible; user dropdown shows Logout; logout redirects to logon |
