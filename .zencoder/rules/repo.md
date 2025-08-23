---
description: Repository Information Overview
alwaysApply: true
---

# Social Media Microservice Information

## Summary
A microservice-based social media platform architecture consisting of five distinct services: API Gateway, Identity Service, Post Service, Media Service, and Search Service. Each service is built with Node.js and Express, communicating through REST APIs and message queues.

## Structure
- **api-gateway**: Entry point for client requests, handles routing to appropriate services
- **identity-service**: Manages user authentication and authorization
- **post-service**: Handles creation and management of user posts
- **media-service**: Manages media uploads and storage using Cloudinary
- **search-service**: Provides search functionality across the platform

## Language & Runtime
**Language**: JavaScript (CommonJS)
**Runtime**: Node.js
**Package Manager**: npm
**Express Version**: ^5.1.0

## Dependencies

### Common Dependencies
- **express**: ^5.1.0 - Web framework
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **dotenv**: ^17.2.1 - Environment variable management
- **helmet**: ^8.1.0 - Security middleware
- **winston**: ^3.17.0 - Logging
- **jsonwebtoken**: ^9.0.2 - JWT authentication
- **express-rate-limit**: ^8.0.1 - Rate limiting
- **mongoose**: ^8.17.1 - MongoDB ODM (except API Gateway)

### Service-Specific Dependencies
- **API Gateway**: express-http-proxy, ioredis, rate-limit-redis
- **Identity Service**: argon2, joi, ioredis, rate-limiter-flexible
- **Media Service**: cloudinary, multer, amqplib, redis
- **Post Service**: amqplib, redis, joi
- **Search Service**: amqplib, redis, joi

## Build & Installation
```bash
# Install dependencies for all services
cd api-gateway && npm install
cd ../identity-service && npm install
cd ../post-service && npm install
cd ../media-service && npm install
cd ../search-service && npm install

# Start all services in development mode
cd api-gateway && npm run dev
cd ../identity-service && npm run dev
cd ../post-service && npm run dev
cd ../media-service && npm run dev
cd ../search-service && npm run dev
```

## Communication
**REST APIs**: Services communicate via HTTP/REST through the API Gateway
**Message Queue**: RabbitMQ for asynchronous communication between services
**Cache/Pub-Sub**: Redis for caching and pub/sub messaging

## Data Storage
**Database**: MongoDB (via Mongoose ODM)
**Media Storage**: Cloudinary cloud service
**Cache**: Redis

## Service Details

### API Gateway (Port 3000)
**Purpose**: Routes client requests to appropriate microservices
**Key Features**: Authentication middleware, request proxying, rate limiting
**Dependencies**: express-http-proxy, ioredis, rate-limit-redis

### Identity Service (Port 3001)
**Purpose**: User authentication and authorization
**Key Features**: JWT token generation, password hashing with Argon2
**Dependencies**: argon2, mongoose, joi, jsonwebtoken

### Post Service (Port 3002)
**Purpose**: Post creation and management
**Key Features**: CRUD operations for posts, event publishing
**Dependencies**: mongoose, amqplib, redis

### Media Service (Port 3003)
**Purpose**: Media upload and management
**Key Features**: File uploads to Cloudinary, media metadata storage
**Dependencies**: cloudinary, multer, mongoose, amqplib

### Search Service
**Purpose**: Search functionality across platform
**Key Features**: Consumes events from other services, maintains search index
**Dependencies**: mongoose, amqplib, redis