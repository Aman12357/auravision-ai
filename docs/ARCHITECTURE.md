# Architecture Documentation

## System Overview
Aura Video AI is designed as a scalable, highly available microservices architecture. It decouples synchronous API requests from long-running asynchronous video generation tasks using an event-driven approach.

## Component Diagram

- **Frontend**: Next.js, React, Tailwind CSS. Handles UI, auth flow, and realtime updates via WebSockets.
- **Backend API**: Spring Boot. Manages users, projects, billing, and API routing.
- **Worker Nodes**: Spring Boot. Consume tasks from Kafka, interact with external AI providers, and handle webhooks.
- **PostgreSQL**: Primary transactional database.
- **Redis**: Caching, session store, rate limiting.
- **Kafka**: Message broker for async tasks.
- **Elasticsearch**: Full-text search for video metadata and centralized logging.
- **S3 / R2**: Object storage for generated videos.

## Data Flow: Video Generation
1. User submits a prompt via POST `/api/v1/videos/generate`.
2. Backend validates request, checks credits, and deducts credits.
3. Backend saves a "PENDING" job in PostgreSQL.
4. Backend publishes a `VideoGenerationEvent` to Kafka topic `video-jobs`.
5. Backend returns HTTP 202 Accepted with Job ID.
6. Worker consumes event. `AiRouterService` selects optimal provider.
7. Worker calls Provider API.
8. Provider processes and either sends webhook or Worker polls.
9. Upon completion, Worker downloads video, uploads to S3.
10. Worker updates DB state to "COMPLETED".
11. Worker sends WebSocket notification to Frontend.

## AI Router Decision Algorithm
The `AiRouterService` determines which provider to use based on:
1. Explicit user selection (if any).
2. Prompt analysis (certain providers excel at certain styles).
3. Current provider health/latency (Circuit Breaker status).
4. Cost optimization (cheapest provider that meets quality threshold).

## Security Architecture
- TLS 1.3 enforced at NGINX.
- JWT-based authentication with short expiration + Refresh tokens.
- 2FA support (TOTP) stored encrypted.
- Data at rest encrypted in PostgreSQL.
- Secrets managed via external secret manager (or env vars in dev).
- Strict CORS and CSP headers.

## Scalability Considerations
- **Stateless API**: Backend nodes can be scaled horizontally.
- **Async Processing**: Video generation does not tie up HTTP threads.
- **Database Scaling**: Read replicas for heavy read loads; indexing on frequently queried fields.
- **Caching**: Heavy reliance on Redis for config data, credits balance checks, and rate limits.
