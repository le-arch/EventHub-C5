# Stage 1: Build Stage

FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client (if using Prisma)
# RUN npx prisma generate

# Build the Next.js application
RUN npm run build


# Stage 2: Production Stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy package.json for any runtime dependencies
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start the application
CMD ["node", "server.js"]