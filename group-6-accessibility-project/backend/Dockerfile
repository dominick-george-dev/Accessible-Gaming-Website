FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client (creates types used by TypeScript)
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Expose the backend port
EXPOSE 3000

CMD ["npm", "run", "start:dev"]