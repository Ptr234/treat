# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be supplied as build args — setting them only at runtime leaves the
# browser bundle pointing at the wrong (empty) origin.
ARG NEXT_PUBLIC_BACKEND_URL=""
ARG NEXT_PUBLIC_SANITY_PROJECT_ID=""
ARG NEXT_PUBLIC_SANITY_DATASET="production"
ARG NEXT_PUBLIC_SANITY_API_VERSION="2025-01-01"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    NEXT_PUBLIC_SANITY_API_VERSION=$NEXT_PUBLIC_SANITY_API_VERSION \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built app from builder. next.config.ts is required at runtime too:
# `next start` reads it for trailingSlash/images/experimental settings, and
# without it the served routes disagree with the ones that were built.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# Loading a TypeScript next.config requires the typescript package at runtime.
# It is a devDependency, so reuse the builder's copy rather than letting
# `next start` try to npm-install it on boot (which fails in a sealed image).
COPY --from=builder /app/node_modules/typescript ./node_modules/typescript

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
