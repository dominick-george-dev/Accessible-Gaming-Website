FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Copy environment file from parent directory
COPY ../.env .env

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Expose the backend port
EXPOSE 3000

# Use production start command
CMD ["npm", "run", "start:prod"]