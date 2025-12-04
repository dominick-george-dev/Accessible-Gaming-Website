FROM node:20-bullseye
 
WORKDIR /app
 
# Install basic tools required by Ollama install script
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    bash \
 && rm -rf /var/lib/apt/lists/*
 
# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | bash
 
# Install backend dependencies
COPY package*.json ./
RUN npm install
 
# Copy backend source
COPY . .
 
# Prisma
RUN npx prisma generate
 
EXPOSE 3000 11434
 
# Start Ollama daemon + backend
CMD ["bash", "-lc", "ollama daemon & npm run start:dev"]