-- ============================================================
-- V5: AI Providers, Routing Logs, API Keys, Webhooks
-- ============================================================

-- AI provider registry and configuration
CREATE TABLE ai_providers (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        VARCHAR(50)     UNIQUE NOT NULL,
    display_name                VARCHAR(100),
    description                 TEXT,
    api_endpoint                TEXT,
    api_key_env_var             VARCHAR(100),   -- env var name holding the API key
    is_enabled                  BOOLEAN         NOT NULL DEFAULT true,
    is_available                BOOLEAN         NOT NULL DEFAULT true,  -- runtime health
    priority                    INTEGER         NOT NULL DEFAULT 5,     -- 1=highest
    cost_per_second             DECIMAL(10,6)   NOT NULL DEFAULT 0,     -- USD
    credits_per_second          INTEGER         NOT NULL DEFAULT 10,
    max_duration_seconds        INTEGER         NOT NULL DEFAULT 60,
    supported_resolutions       TEXT[]          NOT NULL DEFAULT '{}',
    supported_aspect_ratios     TEXT[]          NOT NULL DEFAULT '{}',
    capabilities                JSONB           NOT NULL DEFAULT '{}',
    rate_limit_rpm              INTEGER         NOT NULL DEFAULT 60,
    avg_generation_time_seconds INTEGER         NOT NULL DEFAULT 120,
    success_rate                DECIMAL(5,2)    NOT NULL DEFAULT 100.00,
    last_health_check           TIMESTAMPTZ,
    health_status               VARCHAR(20)     NOT NULL DEFAULT 'UNKNOWN'
                                CHECK (health_status IN ('HEALTHY','DEGRADED','UNHEALTHY','UNKNOWN')),
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_providers_enabled ON ai_providers(is_enabled, is_available, priority);

-- AI router decision logs
CREATE TABLE routing_logs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id           UUID        NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
    provider_name    VARCHAR(50) NOT NULL,
    routing_strategy VARCHAR(50),
    score            DECIMAL(8,4),
    was_selected     BOOLEAN     NOT NULL DEFAULT false,
    was_successful   BOOLEAN,
    response_time_ms INTEGER,
    error_message    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routing_logs_job_id   ON routing_logs(job_id);
CREATE INDEX idx_routing_logs_provider ON routing_logs(provider_name, created_at DESC);
CREATE INDEX idx_routing_logs_selected ON routing_logs(was_selected, created_at DESC);

-- Developer API keys
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users(id),
    name            VARCHAR(100) NOT NULL,
    key_hash        VARCHAR(255) NOT NULL,   -- SHA-256 hash of the actual key
    key_prefix      VARCHAR(10)  NOT NULL,   -- first 8 chars for display (e.g. "aura_sk_")
    scopes          TEXT[]       NOT NULL DEFAULT '{}',
    rate_limit_rpm  INTEGER      NOT NULL DEFAULT 60,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_workspace ON api_keys(workspace_id) WHERE is_active = true;
CREATE INDEX idx_api_keys_hash      ON api_keys(key_hash);

-- Outgoing webhooks configuration
CREATE TABLE webhooks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id     UUID    NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    url              TEXT    NOT NULL,
    events           TEXT[]  NOT NULL DEFAULT '{}',
    secret_hash      VARCHAR(255) NOT NULL,  -- HMAC secret (hashed for storage)
    is_active        BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count    INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_workspace ON webhooks(workspace_id) WHERE is_active = true;

-- ============================================================
-- Seed AI providers
-- ============================================================
INSERT INTO ai_providers (name, display_name, description, api_endpoint, api_key_env_var,
                          priority, cost_per_second, credits_per_second, max_duration_seconds,
                          supported_resolutions, supported_aspect_ratios, capabilities,
                          rate_limit_rpm, avg_generation_time_seconds)
VALUES
    ('GOOGLE_VEO',   'Google Veo',           'Google Veo 2 - State of the art video generation',
     'https://generativelanguage.googleapis.com/v1beta', 'GOOGLE_VEO_API_KEY',
     1, 0.05, 15, 120,
     ARRAY['1920x1080','1280x720','3840x2160'],
     ARRAY['16:9','9:16','1:1'],
     '{"text_to_video":true,"image_to_video":true,"styles":["cinematic","animation","realistic"]}'::jsonb,
     30, 180),

    ('RUNWAY',       'Runway Gen-3',          'Runway Gen-3 Alpha - Professional AI video',
     'https://api.dev.runwayml.com/v1', 'RUNWAY_API_KEY',
     2, 0.04, 12, 120,
     ARRAY['1920x1080','1280x720'],
     ARRAY['16:9','9:16'],
     '{"text_to_video":true,"image_to_video":true,"video_to_video":true}'::jsonb,
     60, 120),

    ('LUMA',         'Luma Dream Machine',    'Luma AI Dream Machine - Cinematic quality',
     'https://api.lumalabs.ai/dream-machine/v1', 'LUMA_API_KEY',
     3, 0.035, 10, 120,
     ARRAY['1920x1080','1280x720'],
     ARRAY['16:9','9:16','1:1'],
     '{"text_to_video":true,"image_to_video":true,"keyframe_control":true}'::jsonb,
     60, 150),

    ('PIKA',         'Pika 2.0',              'Pika Labs - Creative AI video generation',
     'https://api.pika.art/v2', 'PIKA_API_KEY',
     4, 0.03, 9, 60,
     ARRAY['1920x1080','1280x720'],
     ARRAY['16:9','9:16','1:1'],
     '{"text_to_video":true,"image_to_video":true,"lip_sync":true}'::jsonb,
     60, 90),

    ('KLING',        'Kling AI',              'Kling AI - High quality video generation',
     'https://api.klingai.com/v1', 'KLING_API_KEY',
     5, 0.025, 8, 180,
     ARRAY['1920x1080','1280x720','3840x2160'],
     ARRAY['16:9','9:16','1:1'],
     '{"text_to_video":true,"image_to_video":true,"motion_control":true}'::jsonb,
     30, 200),

    ('MINIMAX',      'Minimax Hailuo',        'Minimax Hailuo Video-01',
     'https://api.minimaxi.chat/v1', 'MINIMAX_API_KEY',
     6, 0.02, 7, 60,
     ARRAY['1280x720'],
     ARRAY['16:9'],
     '{"text_to_video":true,"image_to_video":true}'::jsonb,
     60, 100),

    ('PIXVERSE',     'PixVerse',              'PixVerse - Creative video generation',
     'https://api.pixverse.ai/v1', 'PIXVERSE_API_KEY',
     7, 0.02, 7, 60,
     ARRAY['1920x1080','1280x720'],
     ARRAY['16:9','9:16','1:1'],
     '{"text_to_video":true,"image_to_video":true,"style_transfer":true}'::jsonb,
     60, 90),

    ('FAL_AI',       'Fal.ai',               'Fal.ai - Fast inference platform',
     'https://fal.run', 'FAL_API_KEY',
     8, 0.015, 6, 60,
     ARRAY['1280x720','854x480'],
     ARRAY['16:9','1:1'],
     '{"text_to_video":true,"image_to_video":true,"fast_mode":true}'::jsonb,
     120, 60),

    ('REPLICATE',    'Replicate',             'Replicate - Open source model hosting',
     'https://api.replicate.com/v1', 'REPLICATE_API_TOKEN',
     9, 0.01, 5, 60,
     ARRAY['1280x720','854x480'],
     ARRAY['16:9','1:1'],
     '{"text_to_video":true,"image_to_video":true,"custom_models":true}'::jsonb,
     60, 120),

    ('COGVIDEOX',    'CogVideoX',             'CogVideoX - Open source video generation',
     'https://api.replicate.com/v1/predictions', 'REPLICATE_API_TOKEN',
     10, 0.008, 4, 60,
     ARRAY['720x480'],
     ARRAY['16:9'],
     '{"text_to_video":true}'::jsonb,
     30, 180),

    ('WAN_VIDEO',    'Wan Video',             'Wan 2.1 - Open source video model',
     'https://api.replicate.com/v1/predictions', 'REPLICATE_API_TOKEN',
     11, 0.008, 4, 60,
     ARRAY['1280x720'],
     ARRAY['16:9','9:16'],
     '{"text_to_video":true,"image_to_video":true}'::jsonb,
     30, 150);
