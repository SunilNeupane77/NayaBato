#!/bin/bash

# Nayabato Docker Build and Run Script
# This script helps build and run the Nayabato application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if environment file exists
check_env_file() {
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            print_warning ".env file not found. Copying from .env.docker template..."
            cp .env.docker .env
            print_warning "Please update the .env file with your actual configuration values"
        else
            print_error ".env file not found. Please create one based on .env.example"
            exit 1
        fi
    fi
    print_success "Environment file found"
}

# Function to build the application
build_app() {
    print_status "Building Nayabato application..."
    docker-compose build --no-cache
    print_success "Application built successfully"
}

# Function to start services
start_services() {
    local environment=${1:-production}
    
    print_status "Starting Nayabato services in $environment mode..."
    
    if [ "$environment" = "development" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    elif [ "$environment" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    print_success "Services started successfully"
}

# Function to stop services
stop_services() {
    print_status "Stopping Nayabato services..."
    docker-compose down
    print_success "Services stopped successfully"
}

# Function to view logs
view_logs() {
    local service=${1:-nayabato-app}
    print_status "Viewing logs for $service..."
    docker-compose logs -f "$service"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to run database migrations/setup
setup_database() {
    print_status "Setting up database..."
    docker-compose exec nayabato-app npm run db:setup 2>/dev/null || print_warning "Database setup script not found"
    print_success "Database setup completed"
}

# Function to backup database
backup_database() {
    local backup_name="nayabato_backup_$(date +%Y%m%d_%H%M%S)"
    print_status "Creating database backup: $backup_name"
    
    docker-compose exec -T mongodb mongodump --db nayabato --archive > "./backups/$backup_name.archive"
    print_success "Database backup created: ./backups/$backup_name.archive"
}

# Function to restore database
restore_database() {
    local backup_file=$1
    if [ -z "$backup_file" ]; then
        print_error "Please provide backup file path"
        exit 1
    fi
    
    print_status "Restoring database from: $backup_file"
    docker-compose exec -T mongodb mongorestore --db nayabato --archive < "$backup_file"
    print_success "Database restored successfully"
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Nayabato Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build                 Build the application"
    echo "  start [env]          Start services (env: development|production)"
    echo "  stop                 Stop all services"
    echo "  restart [env]        Restart services"
    echo "  logs [service]       View logs (default: nayabato-app)"
    echo "  status               Show service status"
    echo "  setup-db             Setup database"
    echo "  backup-db            Backup database"
    echo "  restore-db [file]    Restore database from backup"
    echo "  cleanup              Clean up Docker resources"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start development     # Start in development mode"
    echo "  $0 start production      # Start in production mode"
    echo "  $0 logs nginx           # View nginx logs"
    echo "  $0 backup-db            # Create database backup"
}

# Create backups directory if it doesn't exist
mkdir -p backups

# Main script logic
case "${1:-help}" in
    "build")
        check_docker
        check_env_file
        build_app
        ;;
    "start")
        check_docker
        check_env_file
        start_services "$2"
        show_status
        print_success "Nayabato is now running!"
        print_status "Access the application at: http://localhost:3000"
        print_status "MongoDB Express (dev): http://localhost:8081"
        ;;
    "stop")
        check_docker
        stop_services
        ;;
    "restart")
        check_docker
        check_env_file
        stop_services
        start_services "$2"
        show_status
        ;;
    "logs")
        check_docker
        view_logs "$2"
        ;;
    "status")
        check_docker
        show_status
        ;;
    "setup-db")
        check_docker
        setup_database
        ;;
    "backup-db")
        check_docker
        backup_database
        ;;
    "restore-db")
        check_docker
        restore_database "$2"
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac
