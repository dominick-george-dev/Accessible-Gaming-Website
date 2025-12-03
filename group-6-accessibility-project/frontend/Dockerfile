FROM node:20-alpine as builder

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm ci --silent

# Copy source code
COPY . .

# Set environment variables for build
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Build the React app (with error handling)
RUN npm run build 2>&1 || (echo "Build failed, check TypeScript errors" && exit 1)

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN addgroup -g 101 -S nginx-group && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx-group -g nginx nginx-user

# Change ownership of nginx directories
RUN chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d

# Make port 8080 available
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]