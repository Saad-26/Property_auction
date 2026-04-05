# High-Concurrency Property Auction Engine

A robust, real-time property auction platform built for high concurrency and ACID-compliant transactions.

## 🏗️ Architecture

This project follows a monorepo structure with two main services:

- **Backend**: Node.js/Express server using Socket.io with a Redis Adapter for horizontal scaling.
- **Frontend**: Next.js 15+ (App Router) with real-time bidding interfaces.

### 💾 Data Strategy
- **PostgreSQL (Prisma)**: Handles all transactional data (Users, Auctions, Bids) ensuring ACID compliance.
- **MongoDB (Mongoose)**: Manages unstructured property metadata (descriptions, images, amenities).
- **Redis**: Acts as the pub/sub backplane for real-time WebSocket communication.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose

### 🛠️ Local Setup

1. **Start Infrastructure**
   ```bash
   docker compose up -d
   ```

2. **Initialize Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

3. **Start Servers**
   - **Backend**: `cd backend && npm run dev` (Port 4000)
   - **Frontend**: `cd frontend && npm run dev` (Port 3000)

## 🐳 Docker Deployment

The project includes production-ready Dockerfiles for both services:
- **Backend Dockerfile**: Compiles TypeScript and runs the production build.
- **Frontend Dockerfile**: Utilizes Next.js Standalone mode for minimal image size.

## ☁️ CI/CD

A GitHub Actions workflow is included in `.github/workflows/deploy.yml` for automated deployment to **Amazon ECR**.

---
*Built with ❤️ by Antigravity*
