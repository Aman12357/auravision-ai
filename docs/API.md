# API Documentation

## Authentication
Use JWT Bearer token in the Authorization header: `Authorization: Bearer <token>`

## Base URL
Production: `https://api.aura.ai/api/v1`

## Endpoints Summary

### Auth
- `POST /auth/login`
- `POST /auth/register`

### Users
- `GET /users/me`

### Jobs
- `POST /jobs`
- `GET /jobs/{id}`

See detailed documentation in Swagger UI (`/swagger-ui.html`).
