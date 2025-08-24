# Stage 1: Install dependencies
FROM node:20-alpine@sha256:2f46fd49c767a8cc4f15e610a9b9bca5cca6c24f9c5a5da97a9952932b59a9ac AS deps
WORKDIR /app

# Install curl for healthchecks
RUN apk --no-cache add curl

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies with clean slate
RUN npm ci --ignore-scripts && npm audit fix

# Stage 2: Build the application
FROM node:20-alpine@sha256:2f46fd49c767a8cc4f15e610a9b9bca5cca6c24f9c5a5da97a9952932b59a9ac AS builder
WORKDIR /app

# Define build arguments that can be passed during build time
ARG MONGODB_URI
ARG NEXT_PUBLIC_APP_URL
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET
ARG NEXTAUTH_SECRET
ARG JWT_SECRET
ARG RESEND_API_KEY
ARG EMAIL_FROM

# Set environment variables for the build
ENV MONGODB_URI=${MONGODB_URI}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV JWT_SECRET=${JWT_SECRET}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV EMAIL_FROM=${EMAIL_FROM}
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine@sha256:2f46fd49c767a8cc4f15e610a9b9bca5cca6c24f9c5a5da97a9952932b59a9ac AS runner
WORKDIR /app

# Install curl for healthchecks
RUN apk --no-cache add curl

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nayabato && \
    adduser --system --uid 1001 nayabato

# Set environment variables for the production runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the built Next.js application from the 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nayabato:nayabato /app/.next/standalone ./
COPY --from=builder --chown=nayabato:nayabato /app/.next/static ./.next/static

# Create an .env file template that can be populated with environment variables at runtime
RUN echo "MONGODB_URI=\${MONGODB_URI}" > .env.template && \
    echo "NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}" >> .env.template && \
    echo "JWT_SECRET=\${JWT_SECRET}" >> .env.template && \
    echo "RESEND_API_KEY=\${RESEND_API_KEY}" >> .env.template && \
    echo "EMAIL_FROM=\${EMAIL_FROM}" >> .env.template && \
    echo "NEXT_PUBLIC_APP_URL=\${NEXT_PUBLIC_APP_URL}" >> .env.template && \
    echo "CLOUDINARY_CLOUD_NAME=\${CLOUDINARY_CLOUD_NAME}" >> .env.template && \
    echo "CLOUDINARY_API_KEY=\${CLOUDINARY_API_KEY}" >> .env.template && \
    echo "CLOUDINARY_API_SECRET=\${CLOUDINARY_API_SECRET}" >> .env.template

# Create a startup script to generate the .env file at runtime
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo 'envsubst < .env.template > .env' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Set proper permissions
RUN chown -R nayabato:nayabato /app

# Switch to non-root user
USER nayabato

# Expose the port the app runs on
EXPOSE 3000

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD curl --fail http://localhost:3000/api/health || exit 1

# Use the entrypoint script to create the .env file before starting the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "server.js"]