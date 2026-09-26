#!/bin/bash
set -euo pipefail

# Aura Video AI Deployment Script
# Usage: ./deploy.sh [staging|production] [image-tag]

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 [staging|production] [image-tag]"
    exit 1
fi

ENV=$1
TAG=$2

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    echo "Error: Environment must be staging or production"
    exit 1
fi

echo "Deploying Aura Video AI to $ENV with tag $TAG..."

# Update image tags
kubectl set image deployment/aura-backend aura-backend=ghcr.io/aura-video-ai/backend:$TAG -n aura-$ENV
kubectl set image deployment/aura-frontend aura-frontend=ghcr.io/aura-video-ai/frontend:$TAG -n aura-$ENV

# Wait for rollout
echo "Waiting for backend rollout..."
if ! kubectl rollout status deployment/aura-backend -n aura-$ENV --timeout=5m; then
    echo "Backend rollout failed. Rolling back..."
    kubectl rollout undo deployment/aura-backend -n aura-$ENV
    exit 1
fi

echo "Waiting for frontend rollout..."
if ! kubectl rollout status deployment/aura-frontend -n aura-$ENV --timeout=5m; then
    echo "Frontend rollout failed. Rolling back..."
    kubectl rollout undo deployment/aura-frontend -n aura-$ENV
    exit 1
fi

echo "Deployment successful."
