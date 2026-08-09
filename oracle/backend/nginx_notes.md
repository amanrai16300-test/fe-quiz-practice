# FE Quiz API — Nginx routing notes

Expose the FE Quiz FastAPI backend (`127.0.0.1:8010`) through the **existing**
Oracle Nginx, by adding **one** location block. Do not replace the config.

- Route added: `/api/fe/` → `http://127.0.0.1:8010/api/fe/`
- Everything else stays exactly as-is.

## ⚠️ Do NOT touch

- **Do NOT touch** the existing `/api/` downloader routes (port 8000).
- **Do NOT touch** the `/files` routes.
- **Do NOT touch** the qBittorrent routes.
- **Do NOT** expose PostgreSQL port `5432`. It stays local-only.
- **Do NOT** change the `fe-quiz-api` systemd service.
- Preserve existing services: downloader API on `8000`, Nginx/file routes on
  `80` and `8090`.

This change is **add-only**: one new `location /api/fe/` inside the existing
server block. `/api/fe/` is more specific than `/api/`, so Nginx prefix-matches
it first and the downloader is untouched.

All commands run on the Oracle VM.

## 1. Back up the existing Nginx config

```bash
sudo cp /etc/nginx/sites-available/default \
        /etc/nginx/sites-available/default.bak.$(date +%Y%m%d%H%M%S)
```

> If your site config lives elsewhere (e.g. `/etc/nginx/nginx.conf` or a file
> under `/etc/nginx/conf.d/`), back up THAT file instead — see step 2 to find it.

## 2. Inspect existing server blocks (find the right file + server)

```bash
# Which files define server/location blocks:
sudo nginx -T | grep -nE 'server_name|listen|location' | less

# List candidate config files:
ls -l /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null
```

Identify the server block that already handles `listen 80` and the existing
`/api/` downloader route. That is the block to edit.

## 3. Add ONLY the /api/fe/ location to that server block

Open the correct file (commonly `/etc/nginx/sites-available/default`):

```bash
sudo nano /etc/nginx/sites-available/default
```

Paste the block from `nginx-fe-api-location.example` **inside** the existing
`server { ... }` that serves port 80 — alongside the other `location` blocks,
NOT replacing any of them:

```nginx
location /api/fe/ {
    proxy_pass http://127.0.0.1:8010/api/fe/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Leave the existing `/api/`, `/files`, and qBittorrent locations untouched.

## 4. Test the config syntax

```bash
sudo nginx -t
```

Must print `syntax is ok` and `test is successful` before reloading.

## 5. Reload Nginx (no downtime)

```bash
sudo systemctl reload nginx
```

## 6. Test the FE Quiz routes

```bash
curl http://127.0.0.1/api/fe/health
curl http://127.0.0.1/api/fe/exam-sets
curl http://100.95.39.107/api/fe/health
```

Expected: health returns `{"ok":true,"database":true}`; exam-sets lists
`fe-2025-a-public`.

Also confirm the existing downloader still works (sanity check):

```bash
curl http://127.0.0.1/api/   # existing downloader route — must still respond
```

## 7. Rollback (if anything breaks)

Restore the backup made in step 1 and reload:

```bash
sudo cp /etc/nginx/sites-available/default.bak.<TIMESTAMP> \
        /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx
```

Replace `<TIMESTAMP>` with the suffix from your backup file
(`ls /etc/nginx/sites-available/default.bak.*`).
