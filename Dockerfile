# Dependencies stage
FROM node:22.16.0-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Build stage
FROM node:22.16.0-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Create a dummy .env file for build
RUN echo "MONGODB_URI=mongodb://mongodb:27017/nayabato" > .env.local && \
    echo "DB_PASS=dummy" >> .env.local && \
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local && \
    echo "NEXTAUTH_SECRET=build-time-secret" >> .env.local && \
    echo "CLOUDINARY_CLOUD_NAME=dummy" >> .env.local && \
    echo "CLOUDINARY_API_KEY=dummy" >> .env.local && \
    echo "CLOUDINARY_API_SECRET=dummy" >> .env.local && \
    echo "EMAIL_SERVER_HOST=smtp.example.com" >> .env.local && \
    echo "EMAIL_SERVER_PORT=587" >> .env.local && \
    echo "EMAIL_SERVER_USER=dummy" >> .env.local && \
    echo "EMAIL_SERVER_PASSWORD=dummy" >> .env.local && \
    echo "EMAIL_USER=dummy" >> .env.local && \
    echo "EMAIL_PASS=dummy" >> .env.local && \
    echo "EMAIL_FROM=dummy@example.com" >> .env.local && \
    echo "TEST_EMAIL=dummy@example.com" >> .env.local && \
    echo "REPLY_TO_EMAIL=dummy@example.com" >> .env.local && \
    echo "JWT_SECRET=build-time-jwt-secret" >> .env.local && \
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local && \
    echo "GOOGLE_CLIENT_ID=dummy.apps.googleusercontent.com" >> .env.local && \
    echo "GOOGLE_CLIENT_SECRET=dummy-secret" >> .env.local

# Set environment variables for build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Run build with environment variables
RUN npm run build

# Production stage
FROM node:22.16.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js

USER nextjs

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["npm", "start"]
