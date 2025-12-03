# Use a base image that supports running multiple services
FROM node:20-alpine

# Install Docker CLI to manage Ollama container
RUN apk add --no-cache docker-cli curl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client (creates types used by TypeScript)
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Expose the backend port and Ollama port
EXPOSE 3000
EXPOSE 11434

# Create startup script that runs both NestJS and Ollama
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start Ollama in the background' >> /app/start.sh && \
    echo 'echo "Starting Ollama..."' >> /app/start.sh && \
    echo 'docker pull ollama/ollama || echo "Failed to pull Ollama image, continuing..."' >> /app/start.sh && \
    echo 'docker run -d --name ollama \' >> /app/start.sh && \
    echo '  -p 11434:11434 \' >> /app/start.sh && \
    echo '  -v ollama:/root/.ollama \' >> /app/start.sh && \
    echo '  ollama/ollama || echo "Ollama container already running or failed to start"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Wait a moment for Ollama to initialize' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start NestJS application' >> /app/start.sh && \
    echo 'echo "Starting NestJS application..."' >> /app/start.sh && \
    echo 'npm run start:dev' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]