-- ============================================================
-- V7: Analytics Events
-- ============================================================

CREATE TABLE analytics_events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id   UUID        REFERENCES workspaces(id) ON DELETE SET NULL,
    user_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
    session_id     VARCHAR(255),
    event_name     VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    properties     JSONB       NOT NULL DEFAULT '{}',
    ip_address     INET,
    user_agent     TEXT,
    referrer       TEXT,
    page_url       TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (current month + next 2 months)
CREATE TABLE analytics_events_2026_07 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE analytics_events_2026_08 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE analytics_events_2026_09 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE analytics_events_2026_10 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE analytics_events_default PARTITION OF analytics_events DEFAULT;

-- Indexes on partitioned table (inherited by all partitions)
CREATE INDEX idx_analytics_workspace ON analytics_events(workspace_id, created_at DESC);
CREATE INDEX idx_analytics_user      ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_event     ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_session   ON analytics_events(session_id, created_at DESC);
