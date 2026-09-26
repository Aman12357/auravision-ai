# Aura Video AI - Architecture Diagrams

This document contains Mermaid diagrams illustrating the core system architecture, data flows, and AI Router scoring engine.

---

## 1. System Architecture Overview

```mermaid
graph TD
    Client["Next.js 14 Web App / Developer SDK"] -->|HTTPS / WSS / SSE| Nginx["NGINX Reverse Proxy & Rate Limiter"]
    
    subgraph K8s["Kubernetes Production Cluster"]
        Nginx -->|Load Balancer| Backend["Spring Boot 3.3 Backend API (Java 21)"]
        
        Backend -->|SQL Queries| Postgres[("PostgreSQL 16 Primary DB")]
        Backend -->|Cache / Sessions / SSE| Redis[("Redis 7 Cluster")]
        Backend -->|Async Events| Kafka[("Apache Kafka Event Bus")]
        
        Kafka -->|Job Events| Worker["Video Generation Worker Consumer"]
        Worker -->|Intelligent Route| AIRouter["AI Provider Router Engine"]
    end
    
    subgraph Providers["External AI Models (11+ Integrated)"]
        AIRouter -->|API| Veo["Google Veo 2"]
        AIRouter -->|API| Runway["Runway Gen-3"]
        AIRouter -->|API| Luma["Luma Dream Machine"]
        AIRouter -->|API| Pika["Pika 2.0"]
        AIRouter -->|API| Kling["Kling AI"]
        AIRouter -->|API| Minimax["Minimax Hailuo"]
        AIRouter -->|API| Fal["Fal.ai / Wan 2.1"]
    end

    subgraph Storage["Cloud Asset Storage"]
        Worker -->|Upload Video Assets| S3["AWS S3 / Cloudflare R2"]
        S3 -->|Content Delivery| CDN["Cloudflare CDN"]
        Client -->|Stream / Download| CDN
    end
```

---

## 2. AI Router Scoring & Selection Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as User / Client
    participant API as VideoJobController
    participant Kafka as Kafka Topic (VIDEO_GENERATION_REQUESTED)
    participant Worker as VideoGenerationConsumer
    participant Router as AIRouter Engine
    participant Provider as Selected AI Provider
    participant S3 as AWS S3 Storage

    User->>API: POST /api/v1/jobs (Prompt, Duration, Resolution)
    API->>API: Deduct Estimated Credits & Save Job (QUEUED)
    API->>Kafka: Publish VideoJobEvent
    API-->>User: 202 Accepted (Job ID)

    Kafka->>Worker: Consume VideoJobEvent
    Worker->>Router: selectProvider(Request, Strategy)
    
    Note over Router: Calculate Provider Scores (0-100)<br/>Quality(30%) + Cost(25%) + Speed(25%) + SuccessRate(20%)
    Router-->>Worker: Return Best Available Provider (e.g. Google Veo)

    Worker->>Provider: generateVideo(Request)
    Provider-->>Worker: Return Operation ID (PENDING)

    loop Polling Status (Every 10s)
        Worker->>Provider: checkStatus(Operation ID)
        Provider-->>Worker: Return Progress % & Status
        Worker->>User: Broadcast Progress via SSE
    end

    Provider-->>Worker: Status: COMPLETED (Video URL)
    Worker->>S3: Download & Store Video Asset to S3/R2
    Worker->>API: Save VideoAsset, Update Job status=COMPLETED
    Worker->>User: Real-time SSE Notification ("Video Complete!")
```

---

## 3. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ WORKSPACES : owns
    USERS ||--o{ WORKSPACE_MEMBERS : belongs_to
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : contains
    WORKSPACES ||--o{ PROJECTS : owns
    PROJECTS ||--o{ VIDEO_JOBS : contains
    VIDEO_JOBS ||--o{ VIDEO_ASSETS : produces
    VIDEO_JOBS ||--o{ ROUTING_LOGS : records
    WORKSPACES ||--o{ CREDITS : has
    WORKSPACES ||--o{ SUBSCRIPTIONS : has
    PLANS ||--o{ SUBSCRIPTIONS : dictates
    WORKSPACES ||--o{ PAYMENTS : pays
```
