# Docker Deployment Guide

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.docker .env
   ```

2. **Fill in your environment variables in `.env`**

3. **Build and run using the helper script:**
   ```bash
   ./docker-build-run.sh
   ```

   Or manually with docker compose:
   ```bash
   docker pull docker.io/library/mongo:7
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
   ```

The app will be available at http://localhost:3000

## Commands

- **Start services:** `docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d`
- **Stop services:** `docker-compose down`
- **View logs:** `docker-compose logs -f nayabato-app`
- **Rebuild:** `docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build`

## Production Deployment

For production, update the `NEXTAUTH_URL` in your `.env` file to your domain:
```
NEXTAUTH_URL=https://yourdomain.com
```
