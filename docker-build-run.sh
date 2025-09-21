#!/bin/bash
# Docker build and run script for NayaBato application
# This script handles building and running Docker containers for different environments

set -e

# Default values
ENV="dev"
BUILD_ONLY=false
PUSH=false
TAG="latest"
REGISTRY="docker.io"
REPOSITORY="sunilneupane77/nayabato"

# Display help information
show_help() {
    echo "Usage: ./docker-build-run.sh [OPTIONS]"
    echo ""
    echo "Build and run Docker containers for NayaBato application"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV        Environment to use (dev, prod) [default: dev]"
    echo "  -b, --build-only     Build only, don't run containers"
    echo "  -p, --push           Push images to registry after building"
    echo "  -t, --tag TAG        Tag for Docker images [default: latest]"
    echo "  -r, --registry URL   Docker registry URL [default: ghcr.io]"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-build-run.sh                   # Build and run dev environment"
    echo "  ./docker-build-run.sh -e prod           # Build and run prod environment"
    echo "  ./docker-build-run.sh -b -t v1.0.0      # Build only with tag v1.0.0"
    echo "  ./docker-build-run.sh -b -p -r ghcr.io  # Build and push to GitHub registry"
    exit 0
}

# Parse command line options
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -p|--push)
            PUSH=true
            shift
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate environment
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    echo "Error: Environment must be either 'dev' or 'prod'"
    exit 1
fi

# Determine compose files to use
COMPOSE_FILES="-f docker-compose.yml"
if [[ "$ENV" == "dev" ]]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.dev.yml"
    echo "Using development environment configuration"
else
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
    echo "Using production environment configuration"
fi

# Check and prepare environment files
if [ ! -f .env ]; then
    echo "Creating .env file for Docker..."
    cp .env.docker .env 2>/dev/null || echo "Error: No .env.docker file found. Please create one."
    
    if [ $? -ne 0 ]; then
        exit 1
    fi
fi

# Create development environment if needed
if [[ "$ENV" == "dev" && ! -f .env.local ]]; then
    echo "Creating .env.local file for development build..."
    cp .env .env.local 2>/dev/null || echo "MONGODB_URI=mongodb://mongodb:27017/nayabato" > .env.local
fi

# Configure image name and tag
IMAGE_NAME="$REPOSITORY:$TAG"

# Adjust the image name in docker-compose.yml temporarily
if [[ "$TAG" != "latest" ]]; then
    echo "Setting custom tag: $TAG in docker-compose files"
    sed -i.bak "s|image: $REPOSITORY:latest|image: $IMAGE_NAME|g" docker-compose.yml
fi

# Pull required images
echo "Pulling MongoDB image..."
docker pull docker.io/library/mongo:7

# Pull mongo-express for development
if [[ "$ENV" == "dev" ]]; then
    echo "Pulling mongo-express image for development..."
    docker pull docker.io/library/mongo-express:latest
fi

# Build the Docker images
echo "Building Docker images for NayaBato with tag: $TAG"
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1
docker compose $COMPOSE_FILES build

# Restore the original docker-compose.yml if modified
if [[ "$TAG" != "latest" ]]; then
    mv docker-compose.yml.bak docker-compose.yml
fi

# Tag and push the image if push flag is enabled
if [[ "$PUSH" == true ]]; then
    # Get the local image name (always use the repository name)
    LOCAL_IMAGE="$REPOSITORY:$TAG"
    
    # If registry is different from docker.io, create a full registry path
    if [[ "$REGISTRY" != "docker.io" ]]; then
        FULL_IMAGE="$REGISTRY/$REPOSITORY:$TAG"
        echo "Tagging image $LOCAL_IMAGE as: $FULL_IMAGE"
        
        # Tag the image with registry
        docker tag "$LOCAL_IMAGE" "$FULL_IMAGE"
    else
        FULL_IMAGE="$LOCAL_IMAGE"
    fi
    
    # Push to registry
    echo "Pushing image to registry: $FULL_IMAGE"
    docker push "$FULL_IMAGE"
    
    echo "Image pushed successfully to $FULL_IMAGE"
fi

# Run the containers if not build-only
if [[ "$BUILD_ONLY" == false ]]; then
    echo "Starting containers with docker compose..."
    docker compose $COMPOSE_FILES up -d
    
    # Display status of running containers
    echo "Container status:"
    docker compose $COMPOSE_FILES ps
    
    # Show application logs
    echo "Application logs:"
    docker compose $COMPOSE_FILES logs -f nayabato-app
fi

echo "Docker build and run script completed successfully"