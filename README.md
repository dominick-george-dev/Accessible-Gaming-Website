# Accessible Gaming Platform — Team 6

A modern, production-ready, full-stack web application for accessible gaming, built with React, NestJS, Prisma, Neon PostgreSQL, AWS S3, CloudFront, and Docker. This document provides onboarding, build/run instructions, environment configuration, deployment notes, and key development assumptions.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Requirements](#requirements)
- [Important Assumptions](#important-assumptions)
- [CI/CD Pipeline](#ci-cd-pipeline)
- [Tech Stack](#tech-stack)
- [Why These Technologies Were Used](#why-these-technologies-were-used)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [How to Build / Start / Run / Compile](#how-to-build--start--run--compile)
- [Local Development](#local-development)
- [Running With Docker Compose](#running-with-docker-compose)
- [Database (Prisma + Neon)](#database-prisma--neon)
- [AWS S3 and CloudFront](#aws-s3-and-cloudfront)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

# Project Overview

The Accessible Gaming Platform enables users to discover, filter, review, and interact with accessible mobile games. It integrates accessibility-first design through WCAG 2.1 AA standards, voice navigation, keyboard/switch input, captions/transcripts, and personal accessibility preferences.

Core elements include:

- React frontend (Vite + TypeScript + TailwindCSS)
- NestJS backend with JWT authentication
- Neon PostgreSQL database
- Prisma ORM
- AWS S3 for media storage
- Dockerised workflows for local and production environments

---

# Requirements

All Functional, Non-Functional, and Data requirements are documented clearly in the project Wiki.

**Requirements Wiki:**  
https://git.cardiff.ac.uk/c23069362/team-6-accessible-gaming-website/-/wikis/Requirements

---

# Important Assumptions

The following assumptions guided the system’s design:

1. Admin users are trusted internal users with elevated access.
2. Neon PostgreSQL is the primary database and assumed to remain available.
3. Voice navigation relies on the browser’s SpeechRecognition API, which varies by device.
4. All uploaded media (images / trailers) are expected to be accessible and captioned.
5. The platform focuses on mobile games; console and PC support may be extended later.
6. Keyboard and switch navigation are primary accessibility considerations.
7. The architecture must support future scalability (community features, developer dashboards).
8. All users are authenticated before performing personalised actions (reviews, favourites).

---

## CI/CD Pipeline

This Terraform VM deploys a Jenkins server which creates the automated pipeline which triggers after each build of the main branch.

A more detailed explanation of how to get it running can be seen in the below README:
See the Jenkins-specific README for full CI/CD setup and usage:

- [Jenkins CI/CD Setup](./Jenkins_README.md) — Detailed instructions to provision the Terraform VM, install and configure Jenkins, create and manage pipeline jobs, store credentials/secrets, and verify automated builds on the main branch. Includes Terraform examples, deployment commands, and troubleshooting tips.

---

# Tech Stack

### Frontend
- React (Vite)
- TypeScript
- TailwindCSS

### Backend
- NestJS (Node.js)
- Prisma ORM
- Passport + JWT Authentication
- Class Validator / Transformer

### Infrastructure
- Neon PostgreSQL
- AWS S3 (media storage)
- AWS CloudFront (optional CDN)
- Docker + Docker Compose

---

# Why These Technologies Were Used

| Technology | Documentation | Purpose |
|-----------|--------------|---------|
| React | https://react.dev/ | Fast UI + excellent accessibility features |
| Vite | https://vitejs.dev/ | Fast development server and build system |
| TypeScript | https://www.typescriptlang.org/ | Type safety and maintainability |
| TailwindCSS | https://tailwindcss.com/ | Rapid styling and reusable accessibility-friendly UI |
| NestJS | https://nestjs.com/ | Scalable, modular backend with built-in security |
| Prisma | https://www.prisma.io/ | Type-safe, modern ORM with clean schema design |
| Neon PostgreSQL | https://neon.tech/ | Serverless cloud Postgres with branching support |
| AWS S3 | https://aws.amazon.com/s3/ | Reliable, scalable asset storage |
| Docker | https://www.docker.com/ | Reproducible environments for dev and production |

---

# Libraries Used

Visit: https://git.cardiff.ac.uk/c23069362/team-6-accessible-gaming-website/-/wikis/Libraries

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
### To find ur C4 Models

Go to: https://git.cardiff.ac.uk/c23069362/team-6-accessible-gaming-website/-/wikis/Architecture-Diagrams

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
## How to Build / Start / Run / Compile
Frontend
```
cd frontend
npm install
npm run dev
npm run build
npm run preview
```

Backend
```
cd backend
npm install
npm run start:dev
npm run build
npm run start:prod
```

Entire stack via Docker Compose
```
docker compose up --build
```
---

## 💻 Local Development
1. **Clone the repository:**
   ```sh
   git clone https://git.cardiff.ac.uk/c23069362/team-6-accessible-gaming-website.git
   cd group-6-accessibility-project

2. **Download Ollama**
   ```sh
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
     ```
   - Frontend:
     ```sh
     cd ../frontend
     npm install
     ```

4. **Pull the Ollama model (In root terminal)**
   ```sh
   ollama pull llama3.2:1b
   ```
5. **Run the backend:**
   ```sh
   cd backend
   npm run start:dev
   ```
6. **Run the frontend:**
   ```sh
   cd frontend
   npm run dev
   ```

---

## 🐳 Running with Docker Compose
Start the full stack:

Download Docker Desktop via: https://www.docker.com/get-started/ 
```sh
cd group-6-accessibility-project
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
- Await review and approval

---

© 2025 Team 6 — Accessible Gaming Platform