# Nayabato Docker Deployment Guide

This guide provides comprehensive instructions for deploying the Nayabato civic engagement platform using Docker.

## 🏗️ Architecture Overview

The Nayabato application is containerized using a multi-service Docker architecture:

- **nayabato-app**: Next.js application server
- **mongodb**: MongoDB database for data persistence
- **redis**: Redis for session storage and caching
- **nginx**: Reverse proxy and load balancer
- **mongo-express**: Database administration interface (development only)

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB free disk space

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd nayabato
```

### 2. Environment Configuration

Copy the Docker environment template:

```bash
cp .env.docker .env
```

Edit the `.env` file and update the following critical values:

```env
# Generate secure secrets
NEXTAUTH_SECRET=your_secure_nextauth_secret_here
JWT_SECRET=your_secure_jwt_secret_here

# Database credentials
MONGO_ROOT_PASSWORD=your_secure_mongodb_password
REDIS_PASSWORD=your_secure_redis_password

# Email service
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=notifications@yourdomain.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Build and Start

Using the provided script:

```bash
# Development mode
./docker-build-run.sh start development

# Production mode
./docker-build-run.sh start production
```

Or using Docker Compose directly:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `RESEND_API_KEY` | Resend email service API key | Yes | - |
| `CLOUDINARY_*` | Cloudinary configuration | Yes | - |
| `NEXT_PUBLIC_APP_URL` | Public application URL | No | http://localhost:3000 |

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80, 443 | Web server and reverse proxy |
| Nayabato App | 3000 | Next.js application (internal) |
| MongoDB | 27017 | Database (internal) |
| Redis | 6379 | Cache and sessions (internal) |
| Mongo Express | 8081 | Database admin (development only) |

## 🛠️ Management Commands

The `docker-build-run.sh` script provides convenient management commands:

```bash
# Build the application
./docker-build-run.sh build

# Start services
./docker-build-run.sh start [development|production]

# Stop services
./docker-build-run.sh stop

# View logs
./docker-build-run.sh logs [service-name]

# Check service status
./docker-build-run.sh status

# Database backup
./docker-build-run.sh backup-db

# Database restore
./docker-build-run.sh restore-db backup-file.archive

# Cleanup resources
./docker-build-run.sh cleanup
```

## 🔍 Monitoring and Logs

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nayabato-app
docker-compose logs -f mongodb
docker-compose logs -f nginx
```

### Health Checks

All services include health checks. Check status:

```bash
docker-compose ps
```

### Access Points

- **Application**: http://localhost:3000
- **Database Admin** (dev): http://localhost:8081
- **Health Check**: http://localhost/health

## 🔒 Security Considerations

### Production Security

1. **Change Default Passwords**: Update all default passwords in `.env`
2. **SSL/TLS**: Configure SSL certificates in nginx configuration
3. **Firewall**: Restrict access to internal ports (27017, 6379)
4. **Secrets Management**: Use Docker secrets or external secret management
5. **Regular Updates**: Keep base images updated

### SSL Configuration

For production with SSL, update `docker/nginx/default.conf`:

1. Uncomment the HTTPS server block
2. Add your SSL certificates to the `ssl-certs` volume
3. Update the certificate paths in the configuration

## 📊 Performance Tuning

### Resource Limits

Production configuration includes resource limits:

- **App**: 1 CPU, 1GB RAM
- **MongoDB**: 1 CPU, 2GB RAM
- **Redis**: 0.5 CPU, 512MB RAM
- **Nginx**: 0.5 CPU, 256MB RAM

### Scaling

To scale the application:

```bash
docker-compose up -d --scale nayabato-app=3
```

## 🗄️ Database Management

### Initial Setup

The MongoDB container automatically:
- Creates the `nayabato` database
- Sets up collections with validation schemas
- Creates necessary indexes
- Inserts default departments

### Backup and Restore

```bash
# Create backup
./docker-build-run.sh backup-db

# Restore from backup
./docker-build-run.sh restore-db backups/backup_file.archive
```

### Manual Database Access

```bash
# MongoDB shell
docker-compose exec mongodb mongosh nayabato

# Redis CLI
docker-compose exec redis redis-cli
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 80, 3000, 27017, 6379, 8081 are available
2. **Memory Issues**: Increase Docker memory allocation if builds fail
3. **Permission Issues**: Ensure Docker has proper permissions

### Debug Mode

Run in development mode with live reload:

```bash
./docker-build-run.sh start development
```

### Container Shell Access

```bash
# Application container
docker-compose exec nayabato-app sh

# Database container
docker-compose exec mongodb bash
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./docker-build-run.sh stop
./docker-build-run.sh build
./docker-build-run.sh start production
```

### Database Migrations

```bash
# Run migrations (if available)
docker-compose exec nayabato-app npm run migrate
```

## 📈 Production Deployment

### Recommended Production Setup

1. **Use Docker Swarm or Kubernetes** for orchestration
2. **External Database**: Use managed MongoDB service
3. **Load Balancer**: Use external load balancer (AWS ALB, etc.)
4. **Monitoring**: Implement logging and monitoring solutions
5. **Backup Strategy**: Automated database backups
6. **CI/CD Pipeline**: Automated deployment pipeline

### Environment-Specific Configurations

Create separate environment files:
- `.env.development`
- `.env.staging`
- `.env.production`

## 🆘 Support

For issues and questions:
1. Check the logs: `./docker-build-run.sh logs`
2. Verify configuration: `./docker-build-run.sh status`
3. Review this documentation
4. Check the main README.md for application-specific issues

## 📝 License

This Docker configuration is part of the Nayabato project and follows the same license terms.
