# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app

# Install build dependencies for node-gyp and canvas (required for pdfjs-dist)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies and project files
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Prepare the production image
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Set user and expose port
USER nextjs
EXPOSE 3000

# Run the Next.js server
CMD ["node", "server.js"]
