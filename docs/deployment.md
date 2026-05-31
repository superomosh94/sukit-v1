# Deployment Guide

## Option 1: Docker (Recommended)

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts PostgreSQL, Redis, and the SUKIT app in containers.

To rebuild after updates:

```bash
git pull
docker compose -f docker/docker-compose.yml up -d --build
```

## Option 2: Manual Deployment

### Build

```bash
pnpm install
pnpm build
```

### Serve with PM2

```bash
npm install -g pm2
pm2 start apps/web/node_modules/.bin/next --name sukit -- start -p 3000
pm2 start apps/server/dist/index.js --name sukit-server
pm2 save
pm2 startup
```

## Option 3: Single-Binary (Future)

The Rust rewrite will provide a single executable:

```bash
./sukit serve
```

No Node.js, PostgreSQL, or Redis required. (In development.)

## Environment Variables Checklist

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT encryption key (32+ chars) |
| `NEXTAUTH_URL` | Yes | Public URL of your instance |
| `REDIS_URL` | Yes | Redis connection string |
| `STORAGE_TYPE` | Yes | `local` or `s3` |
| `STORAGE_PATH` | If local | Path for file uploads |

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name sukit.yourdomain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d sukit.yourdomain.com
```

Certbot automatically edits the Nginx config and sets up auto-renewal.
