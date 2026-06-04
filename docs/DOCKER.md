# Docker/Web Guide

Docker/Web runs the CCPG daemon and browser panel inside a container. It is the
same gateway backend used by the desktop app, but state is stored in SQLite and
the panel is served over HTTP.

Use this guide when you want to run CCPG without the desktop app, expose it
through Docker Compose, change ports, persist state, or place it behind a
reverse proxy.

## Quick Start

From the repository root:

```bash
docker compose up -d --build
```

Open:

| Service | URL |
|---|---|
| Panel UI and panel API | `http://localhost:6767` |
| Anthropic/OpenAI-compatible gateway | `http://localhost:49250/v1` |

Check status:

```bash
docker compose ps
docker compose logs -f ccpg
curl -s http://127.0.0.1:6767/api/status
```

Stop the container:

```bash
docker compose down
```

Remove the persisted Docker/Web state as well:

```bash
docker compose down -v
```

## Runtime Model

The Compose service runs one Node process that starts two HTTP servers:

| Server | Internal port | Purpose |
|---|---:|---|
| Panel | `6767` | Browser UI and `/api/*` management routes |
| Gateway proxy | `49250` | Claude Code Anthropic-compatible API and OpenAI-compatible `/v1` API |

Docker/Web differs from the desktop app in three important ways:

- The daemon runs inside the container, not on the host.
- The host reaches the daemon through Docker port publishing.
- Config, encrypted secrets, and sessions are stored in SQLite at `/data/ccpg.sqlite`.

Because the daemon is containerized, automatic Terminal Integration cannot edit
your host shell files. The dashboard shows manual shell snippets for your host
terminal instead.

## Compose File

The default `docker-compose.yml`:

```yaml
services:
  ccpg:
    build:
      context: .
    image: cc-provider-gtw:local
    environment:
      NODE_ENV: production
      CCPG_RUNTIME_MODE: docker
      CCPG_STORAGE_BACKEND: sqlite
      CCPG_SQLITE_PATH: /data/ccpg.sqlite
      CCPG_CONFIG_DIR: /data
      CCPG_PANEL_PORT: "6767"
      CCPG_PROXY_PORT: "49250"
      CC_GATEWAY_BIND_HOST: 0.0.0.0
    ports:
      - "6767:6767"
      - "49250:49250"
    volumes:
      - ccpg_data:/data
    restart: unless-stopped
```

The left side of each `ports:` entry is the host port. The right side is the
container port:

```yaml
ports:
  - "HOST_PANEL_PORT:CONTAINER_PANEL_PORT"
  - "HOST_PROXY_PORT:CONTAINER_PROXY_PORT"
```

For the simple case, keep host and container ports identical.

## Environment Variables

### Required For Docker/Web

| Variable | Default in Compose | Required | Description |
|---|---|---:|---|
| `NODE_ENV` | `production` | Yes | Makes the daemon serve the built panel directly and use production panel-origin checks. |
| `CCPG_RUNTIME_MODE` | `docker` | Yes | Enables Docker/Web behavior in the panel and session tracking. Terminal Integration is treated as host-manual only. |
| `CCPG_STORAGE_BACKEND` | `sqlite` | Yes | Selects SQLite storage for config, encrypted secrets, current sessions, and session history. |
| `CCPG_SQLITE_PATH` | `/data/ccpg.sqlite` | Yes | Path to the SQLite database inside the container. Keep this under the persisted `/data` volume. |
| `CCPG_CONFIG_DIR` | `/data` | Yes | Directory for support files such as the master key, logs, uploaded provider logos, and PID files. |
| `CCPG_PANEL_PORT` | `6767` | Yes | Internal panel port the daemon listens on. Must match the container side of the panel `ports:` mapping. |
| `CCPG_PROXY_PORT` | `49250` | Yes | Internal gateway proxy port the daemon listens on. Must match the container side of the proxy `ports:` mapping. |
| `CC_GATEWAY_BIND_HOST` | `0.0.0.0` | Yes | Bind address for both daemon servers. Docker needs `0.0.0.0` so published ports can reach the process. |

### Optional

| Variable | Default | Description |
|---|---|---|
| `CCPG_AUTH_TOKEN` | Auto-generated and encrypted | Fixed gateway auth token. Usually leave unset so CCPG generates and persists one. Set only if you intentionally need a stable externally managed token. |
| `CCPG_PANEL_ORIGINS` | Empty | Comma-separated extra browser origins allowed to call the panel API, for example `https://ccpg.example.com`. `http://localhost:<panelPort>` and `http://127.0.0.1:<panelPort>` are allowed automatically. |
| `CC_GATEWAY_SECRET_KEY` | `/data/secret.key` or generated | 32-byte hex AES-256-GCM master key. In Docker, prefer the persisted `/data/secret.key` unless you manage secrets externally. |
| `NO_PROXY` | Localhost entries are ensured | Hosts that bypass the outbound proxy. CCPG always includes `localhost`, `127.0.0.1`, and `::1`. |
| `CCPG_DISABLE_HOST_SHELL_SETUP` | unset | Disables automatic shell setup in host runtimes. Docker mode already disables automatic host shell setup. |

### Development-Only Variables

These are not needed for the Docker/Web production path:

| Variable | Used by | Description |
|---|---|---|
| `CC_GATEWAY_EXTERNAL_DAEMON` | Desktop/source dev | Tells the desktop app that a dev daemon is managed externally. |
| `VITE_CC_GATEWAY_EXTERNAL_DAEMON` | Panel/source dev | Tells the Vite dev panel how to reach an external daemon. |

## Changing Ports

In Docker/Web, the Settings page does not control published Docker ports. Change
ports in Compose before the container starts.

### Same Host And Container Ports

Example: run the panel on `7777` and the gateway on `49300`.

```yaml
services:
  ccpg:
    environment:
      CCPG_PANEL_PORT: "7777"
      CCPG_PROXY_PORT: "49300"
    ports:
      - "7777:7777"
      - "49300:49300"
```

Then recreate:

```bash
docker compose up -d --build
```

Open:

| Service | URL |
|---|---|
| Panel | `http://localhost:7777` |
| Gateway | `http://localhost:49300/v1` |

### Different Host And Container Ports

You can keep the internal container ports unchanged and publish different host
ports:

```yaml
services:
  ccpg:
    environment:
      CCPG_PANEL_PORT: "6767"
      CCPG_PROXY_PORT: "49250"
    ports:
      - "7777:6767"
      - "49300:49250"
```

Use this when you want the container to keep defaults but avoid host port
conflicts. The dashboard and generated launch commands are based on the daemon
config, so same host/container ports are simpler for local Claude Code usage.

## Storage And Persistence

The default Compose file persists `/data` in a named volume:

```yaml
volumes:
  - ccpg_data:/data
```

Files stored under `/data` include:

| Path | Purpose |
|---|---|
| `/data/ccpg.sqlite` | Config document, encrypted secrets, current sessions, and session archive |
| `/data/secret.key` | Master key used to encrypt secret values when `CC_GATEWAY_SECRET_KEY` is not set |
| `/data/daemon.log` | Daemon log file |
| `/data/provider-logos/` | Uploaded custom provider logos and support files |

Do not delete `/data/secret.key` unless you also intend to reset encrypted
secrets. If the key is lost, existing encrypted provider keys and OAuth tokens
cannot be decrypted.

### Backup

Stop the container before taking a consistent backup:

```bash
docker compose down
docker run --rm -v cc-provider-gtw_ccpg_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/ccpg-data-backup.tgz -C /data .
docker compose up -d
```

If your Compose project name differs, the volume name may not be
`cc-provider-gtw_ccpg_data`. Check it with:

```bash
docker volume ls | grep ccpg_data
```

### Restore

```bash
docker compose down
docker run --rm -v cc-provider-gtw_ccpg_data:/data -v "$PWD":/backup alpine \
  sh -c "rm -rf /data/* && tar xzf /backup/ccpg-data-backup.tgz -C /data"
docker compose up -d
```

## Terminal Integration

Docker/Web cannot auto-install the `ccpg` shell function into your host shell.
The container sees its own filesystem, not your host `~/.zshrc`, `~/.bashrc`,
Fish config, or PowerShell profile.

Use the dashboard:

1. Open `http://localhost:6767`.
2. Go to **Dashboard -> Terminal Integration**.
3. Copy the manual command for your shell.
4. Paste it into a terminal on the host system.
5. Relaunch the terminal.

Then launch Claude Code from the host:

```bash
ccpg --OpenRouter
ccpg --CommandCode
ccpg --ModelChain
ccpg --all
```

The shell function asks the panel API to prepare a session, exports the required
Claude Code environment variables, starts `claude` on the host, and sends
session heartbeats back to the container.

## Provider Configuration

Configure providers from the browser panel exactly as in the desktop app:

1. Open **Providers**.
2. Enable a built-in provider or add a custom OpenAI/Anthropic-compatible provider.
3. Add the API key or complete OAuth where supported.
4. Click **Test**.
5. Launch through **Quick Launch** or the host shell `ccpg` function.

Secrets are encrypted before persistence. In Docker/Web, encrypted secret
entries live in SQLite and are protected by `/data/secret.key` or
`CC_GATEWAY_SECRET_KEY`.

## Outbound Proxy

The **Settings -> Outbound Proxy** section is still useful in Docker/Web. It
routes provider API calls, model catalog fetches, and OAuth token exchanges
through an HTTP/HTTPS proxy.

Use it when:

- Your network requires an outbound corporate proxy.
- A provider blocks direct traffic from your current region.
- OAuth token exchange succeeds only through a supported network.

The URL must start with `http://` or `https://` and must not contain embedded
credentials.

Example:

```text
http://proxy.internal:8080
```

Proxy changes require a container restart because outbound network setup is
configured during daemon startup:

```bash
docker compose restart ccpg
```

If the proxy itself runs on the Docker host, avoid `127.0.0.1` inside the
container because that points at the container. Use a host-reachable address,
for example `host.docker.internal` where supported, a LAN IP, or a proxy
container on the same Docker network.

## Reverse Proxy

You can put the panel behind a reverse proxy such as Caddy, Nginx, Traefik, or
Cloudflare Tunnel. In that case:

1. Keep `CC_GATEWAY_BIND_HOST=0.0.0.0` inside the container.
2. Publish or proxy the panel port.
3. Add the public panel origin to `CCPG_PANEL_ORIGINS`.
4. Restart the container.

Example:

```yaml
services:
  ccpg:
    environment:
      CCPG_PANEL_ORIGINS: "https://ccpg.example.com"
    ports:
      - "127.0.0.1:6767:6767"
      - "127.0.0.1:49250:49250"
```

Keep the gateway proxy private unless you intentionally need remote
OpenAI-compatible access. The proxy requires an auth token, but it is designed
for local/private use.

## OpenAI-Compatible Clients

External OpenAI-compatible tools can use the gateway:

| Field | Value |
|---|---|
| Base URL | `http://127.0.0.1:49250/v1` |
| API key | Gateway auth token from the panel's OpenAI Gateway view |
| Models endpoint | `GET /v1/models` |
| Chat endpoint | `POST /v1/chat/completions` |

If you changed the host proxy port, update the base URL accordingly.

## Upgrades

Rebuild and restart:

```bash
git pull
docker compose up -d --build
```

The SQLite database and master key remain in the `ccpg_data` volume. If a future
release changes the storage schema, migrations are applied by the daemon on
startup.

## Healthcheck

The image and Compose file use a healthcheck against the panel API:

```bash
fetch('http://127.0.0.1:'+(process.env.CCPG_PANEL_PORT||6767)+'/api/status')
```

Useful commands:

```bash
docker compose ps
docker inspect --format '{{json .State.Health}}' cc-provider-gtw-ccpg-1
docker compose logs -f ccpg
```

The exact container name depends on the Compose project name.

## Security Notes

- Do not publish the panel or gateway to the public internet without an
  authenticated reverse proxy or private network boundary.
- Keep `/data/secret.key` private. It protects encrypted provider keys, OAuth
  tokens, and the gateway auth token.
- Prefer loopback-only host publishing when a reverse proxy runs on the same
  host:

```yaml
ports:
  - "127.0.0.1:6767:6767"
  - "127.0.0.1:49250:49250"
```

- Leave `CCPG_AUTH_TOKEN` unset unless you deliberately manage the gateway token
  outside CCPG.

## Troubleshooting

### The Panel Does Not Open

Check the container and logs:

```bash
docker compose ps
docker compose logs -f ccpg
curl -s http://127.0.0.1:6767/api/status
```

Confirm:

- `CC_GATEWAY_BIND_HOST=0.0.0.0`
- `CCPG_PANEL_PORT` matches the container side of the panel `ports:` mapping
- No other process is already using the host panel port

### Settings Save Fails From The Browser

If you access the panel through a custom hostname or reverse proxy, set
`CCPG_PANEL_ORIGINS` to that exact origin:

```yaml
environment:
  CCPG_PANEL_ORIGINS: "https://ccpg.example.com"
```

Then restart:

```bash
docker compose restart ccpg
```

### Claude Code Retries But Live Logs Stay Empty

This usually means Claude Code on the host is not reaching the container proxy
or is not using the generated gateway environment variables.

Check from the host:

```bash
curl -s http://127.0.0.1:49250/
```

Then reinstall or refresh the manual Terminal Integration snippet from the
dashboard and launch through:

```bash
ccpg --CommandCode
```

### Terminal Integration Mentions Container Shells

In Docker/Web, automatic install is intentionally disabled because it would edit
the container shell. Use the manual snippet in a host terminal.

### Provider OAuth Fails With Region Or Network Errors

Configure **Settings -> Outbound Proxy**, save, and restart the container:

```bash
docker compose restart ccpg
```

If your proxy is on the host, use a host-reachable address instead of
`127.0.0.1`.

### Port Changes Do Not Take Effect

Changing the Settings page is not enough in Docker/Web. Update
`docker-compose.yml`, then recreate:

```bash
docker compose up -d --build
```

If you changed host ports only, update your browser URL, OpenAI-compatible
client base URL, and any manually copied launch commands.

