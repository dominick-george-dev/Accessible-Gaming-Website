# Accessible Gaming Platform — Team 6

A modern, production-ready, full-stack web application for accessible gaming, built with React, NestJS, Prisma, Neon PostgreSQL, AWS S3, CloudFront, and Docker. This document provides clear onboarding, local development, environment configuration, deployment, and operational instructions.

---

## 📚 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Running with Docker Compose](#running-with-docker-compose)
- [Database (Prisma + Neon)](#database-prisma--neon)
- [AWS S3 & CloudFront](#aws-s3--cloudfront)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🧩 Project Overview
This platform enables users to discover, review, and interact with accessible games. It features:
- High-performance React frontend (Vite, TypeScript, TailwindCSS)
- Secure, JWT-authenticated NestJS API
- Neon PostgreSQL database with Prisma ORM
- AWS S3 for asset storage (with optional CloudFront CDN)
- Dockerized for easy local and production deployment
- Role-based authentication and protected routes

---

## 🛠️ Tech Stack
**Frontend:**
- React (Vite)
- TypeScript
- TailwindCSS
- Axios

**Backend:**
- Node.js + NestJS
- Prisma ORM
- Passport + JWT Auth
- Class Validator / Transformer

**Infrastructure:**
- Neon PostgreSQL (cloud-hosted)
- AWS S3 (assets)
- AWS CloudFront (optional CDN)
- Docker + Docker Compose

---

## 🏗️ Architecture
```
┌─────────────────────────────┐
│      React Frontend         │
│  (Vite + TailwindCSS)       │
│   http(s)://<frontend>      │
└─────────────┬───────────────┘
              │ (HTTPS)
              ▼
┌─────────────────────────────┐
│      NestJS Backend         │
│  Auth, APIs, ACL, Prisma    │
│   http(s)://<backend>       │
└─────────────┬───────────────┘
              │ Prisma
              ▼
┌─────────────────────────────┐
│     Neon PostgreSQL DB      │
└─────────────────────────────┘
              │ File Uploads
              ▼
┌─────────────────────────────┐
│        AWS S3 Bucket        │
└─────────────────────────────┘
              │ CDN (Optional)
              ▼
┌─────────────────────────────┐
│      AWS CloudFront         │
└─────────────────────────────┘
```

---

## 📁 Repository Structure
```
project-root/
│
├── backend/
│   ├── src/                # NestJS source code
│   ├── prisma/             # Prisma schema & migrations
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/                # React source code
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .env
```

---

## 🔐 Environment Variables
Create a root `.env` file with the following (edit values as needed):
```env
# BACKEND
JWT_SECRET=super_secret_key_here

# NEON DATABASE
DATABASE_URL=postgresql://USER:PASSWORD@HOST/db?sslmode=require

# AWS STORAGE
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_S3_BUCKET=my-bucket
AWS_REGION=eu-north-1
AWS_CLOUDFRONT_URL=https://xxxx.cloudfront.net
```

---

## 💻 Local Development
1. **Clone the repository:**
   ```sh
   git clone https://git.cardiff.ac.uk/c23069362/team-6-accessible-gaming-website.git
   cd group-6-accessibility-project

2. **Download Ollama**

   Navigate to https://ollama.com/download
   Click "Download for Windows"
   Run the "OllamaSetup.exe"
   Follow the Install Steps
   ```
3. **Install dependencies and ollama model:**
   - Backend:
     ```sh
     cd backend
     npm install
     ollama pull llama3.2:1b
     ```
   - Frontend:
     ```sh
     cd ../frontend
     npm install
     ```
4. **Run the backend:**
   ```sh
   cd backend
   npm run start:dev
   ```
5. **Run the frontend:**
   ```sh
   cd frontend
   npm run dev
   ```

---

## 🐳 Running with Docker Compose
Start the full stack:
```sh
docker compose up --build
```
This launches:
- Backend (NestJS)
- Frontend (React)
- PostgreSQL (Neon external or local optional)

---

## 🗃️ Database (Prisma + Neon)
- **Run migrations:**
Ensure you have all the uptodate migrations in your branch for this to work.
  ```sh
  cd backend
  npx prisma migrate dev --name example_name
  ```
- **Regenerate Prisma client:**
  ```sh
  npx prisma generate
  ```
- **Open Prisma Studio:**
  ```sh
  npx prisma studio
  ```

---

## ☁️ AWS S3 & CloudFront
This has already been set up however if you would like to create your own:
1. **Create an S3 bucket** (set region, enable public access or use signed URLs)
2. **Create IAM user** (with appropriate S3 policies)
3. **(Optional) Create CloudFront distribution** (origin → S3 bucket)
4. **Update your .env** with S3 and CloudFront details

---

## 🧪 Testing
- **Backend:**
  ```sh
  npm run test
  npm run test:e2e
  npm run test:cov
  ```
- **Frontend:**
  ```sh
  npm run test
  ```

---

## 🚀 Production Deployment
- **Option A — Docker Compose (recommended):**
  ```sh
  docker compose -f docker-compose.prod.yml up --build -d
  ```
- **Option B — Render / Railway / Fly.io:**
  - Deploy backend container
  - Use Neon database
  - Point frontend env → backend API
- **Option C — AWS EC2 / Lightsail:**
  - Install Docker
  - Clone repo
  - Run Docker Compose as above

---

## ❗ Troubleshooting
- **JWT issues:** Ensure JwtAuthGuard is used and Authorization header is correct
- **.env issues:** Check for correct values and Docker context
- **Prisma connection:** Use `?sslmode=require` for Neon
- **CORS:**
  ```js
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  });
  ```
- **S3 upload:** Check bucket policy, IAM key, and region

---

## 🤝 Contributing
- Create a feature branch
- Follow code style and conventions
- Submit a pull request
- Await review and approve

---

© 2025 Team 6 — Accessible Gaming Platform