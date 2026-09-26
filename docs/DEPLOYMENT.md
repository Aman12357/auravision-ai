# Deployment Guide

## Prerequisites
- Kubernetes cluster
- kubectl
- helm

## Environment Variables
See `infra/k8s/backend/secret.yaml` for a list of required variables.

## Deployment Steps
1. Configure secrets
2. Apply Kustomize: `kubectl apply -k infra/k8s/`
3. Verify deployment: `kubectl get pods -n aura-production`

## Monitoring Setup
Prometheus and Grafana are included in the monitoring folder.

## Scaling
The backend is scaled via HPA based on CPU and memory usage.
