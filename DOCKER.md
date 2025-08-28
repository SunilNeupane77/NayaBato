# Docker Deployment Guide

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.docker .env
   ```

2. **Fill in your environment variables in `.env`**

3. **Build and run:**
   ```bash
   docker-compose up --build
   ```

The app will be available at http://localhost:3000

## Commands

- **Start services:** `docker-compose up -d`
- **Stop services:** `docker-compose down`
- **View logs:** `docker-compose logs -f app`
- **Rebuild:** `docker-compose up --build`

## Production Deployment

For production, update the `NEXTAUTH_URL` in your `.env` file to your domain:
```
NEXTAUTH_URL=https://yourdomain.com
```
