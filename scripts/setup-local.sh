#!/bin/bash
set -e

echo "Starting local environment setup for Aura Video AI..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
    else
        echo "Warning: .env.example not found"
    fi
fi

# Start services
docker-compose up -d postgres redis kafka

echo "Waiting for Postgres..."
sleep 10

echo "Running migrations..."
cd backend && mvn flyway:migrate && cd ..

echo "Local environment is ready!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "Swagger UI: http://localhost:8080/swagger-ui.html"
