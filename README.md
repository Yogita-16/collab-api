# Collab API

Advanced Task Management & Collaboration Platform API built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication with JWT
- ✅ Task management with advanced features
- ✅ Project management with collaboration
- ✅ Real-time notifications
- ✅ File uploads
- ✅ Security hardening
- ✅ Performance optimization
- ✅ Comprehensive testing
- ✅ Docker support
- ✅ Production-ready

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Caching**: Redis
- **Auth**: JWT
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Testing**: Jest, Supertest
- **Deployment**: Docker, Railway/Render
- **Logging**: Winston

## Installation

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional)

### Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/collab-api.git
cd collab-api

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev

# 5. Server runs on http://localhost:3000
```

## API Documentation

Visit `/api/docs` for complete API documentation

### Example Endpoints

```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

# Create task
POST /api/tasks
Authorization: Bearer TOKEN
{
  "title": "Learn Node.js",
  "projectId": "PROJECT_ID",
  "priority": "high"
}
```

## Docker Setup

```bash
# Build and run
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Deployment

### Railway

```bash
# Connect repository and deploy
# Set environment variables in dashboard
```

### Render

```bash
# Connect GitHub repository
# Create Web Service
# Set environment variables
```

## Project Structure
