# Social Media Microservice Platform

A microservice-based social media platform built with **Node.js** and **Express**, featuring five independent services that communicate via **REST APIs**, **Redis**, and **RabbitMQ**.

## Services Overview

- **API Gateway (Port 3000)**: Routes client requests to respective services, handles authentication, and enforces rate limiting.
- **Identity Service (Port 3001)**: Manages user registration, authentication, and JWT-based authorization.
- **Post Service (Port 3002)**: Handles creation, reading, updating, and deletion of user posts.
- **Media Service (Port 3003)**: Manages media uploads to Cloudinary and metadata storage.
- **Search Service (Port 3004)**: Maintains search indices and consumes events from other services.

## Key Features

- Microservice architecture for modularity and scalability.
- **REST API** design for client and inter-service communication.
- **Redis** caching, pub/sub messaging, and rate limiting.
- **RabbitMQ** for asynchronous, event-driven workflows.
- Secure user authentication with **JWT** and password hashing (**Argon2**).
- Persistent data storage with **MongoDB** and media storage via **Cloudinary**.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Cache & Messaging**: Redis, RabbitMQ
- **Authentication**: JWT, Argon2
- **Media**: Cloudinary
- **Security**: Helmet, dotenv

## Installation

```bash
# Clone repository
git clone https://github.com/your-github-repo/social-media-microservices.git
cd social-media-microservices

# Install dependencies for each service
cd api-gateway && npm install
cd ../identity-service && npm install
cd ../post-service && npm install
cd ../media-service && npm install
cd ../search-service && npm install

# Start each service in development mode
cd api-gateway && npm run dev
cd ../identity-service && npm run dev
cd ../post-service && npm run dev
cd ../media-service && npm run dev
cd ../search-service && npm run dev

