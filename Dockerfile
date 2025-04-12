# Dockerfile

# 1. Base Node image for dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
COPY app/package.json app/package-lock.json* ./

# Install dependencies (ignore peer deps conflict for React 19)
RUN npm ci --legacy-peer-deps

# 2. Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application code
COPY app/ ./

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# 3. Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

# Install sharp dependencies if needed (uncomment if using next/image with sharp)
# RUN apk add --no-cache libvips

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=node:node /app/.next/standalone ./ # Adjust this line if you use standalone output
# COPY --from=builder --chown=node:node /app/.next/static ./.next/static # Adjust if needed

# Create a non-root user
USER node

# Expose the port Next.js runs on
EXPOSE 3000

# Define the command to start the app
# If using standalone output:
# CMD ["node", "server.js"]
# If not using standalone output:
CMD ["npm", "start"]