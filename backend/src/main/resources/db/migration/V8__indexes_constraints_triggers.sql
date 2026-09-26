-- ============================================================
-- V8: Additional Indexes, Constraints & updated_at Triggers
-- ============================================================

-- Enable trigram extension for fuzzy/full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================================
-- Full-text search indexes
-- ============================================================
CREATE INDEX idx_projects_name_trgm    ON projects      USING gin (name gin_trgm_ops);
CREATE INDEX idx_users_fullname_trgm   ON users         USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_users_email_trgm      ON users         USING gin (email gin_trgm_ops);

-- ============================================================
-- Partial indexes for common filtered queries
-- ============================================================
-- Active/queued jobs (most queried subset)
CREATE INDEX idx_video_jobs_queued  ON video_jobs(created_at DESC) WHERE status = 'QUEUED';
CREATE INDEX idx_video_jobs_running ON video_jobs(started_at DESC)  WHERE status = 'PROCESSING';
CREATE INDEX idx_video_jobs_failed  ON video_jobs(created_at DESC)  WHERE status = 'FAILED';

-- Active subscriptions
CREATE INDEX idx_subscriptions_active ON subscriptions(workspace_id, current_period_end)
    WHERE status = 'ACTIVE';

-- Active API keys
CREATE INDEX idx_api_keys_active ON api_keys(key_hash) WHERE is_active = true;

-- Unread notifications
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC)
    WHERE read = false;

-- Pending invitations
CREATE INDEX idx_invitations_pending ON team_invitations(email, expires_at)
    WHERE status = 'PENDING';

-- ============================================================
-- BRIN indexes for time-series append-mostly tables
-- ============================================================
CREATE INDEX idx_audit_logs_brin       ON audit_logs       USING brin(created_at);
CREATE INDEX idx_credit_tx_brin        ON credit_transactions USING brin(created_at);
CREATE INDEX idx_routing_logs_brin     ON routing_logs     USING brin(created_at);

-- ============================================================
-- Check constraints
-- ============================================================
ALTER TABLE workspaces        ADD CONSTRAINT chk_storage_positive    CHECK (storage_used_bytes >= 0);
ALTER TABLE workspaces        ADD CONSTRAINT chk_credits_positive     CHECK (credits_balance >= 0);
ALTER TABLE video_jobs        ADD CONSTRAINT chk_progress_range       CHECK (progress_percent BETWEEN 0 AND 100);
ALTER TABLE video_jobs        ADD CONSTRAINT chk_retry_count          CHECK (retry_count <= max_retries);
ALTER TABLE ai_providers      ADD CONSTRAINT chk_success_rate         CHECK (success_rate BETWEEN 0 AND 100);
ALTER TABLE feature_flags     ADD CONSTRAINT chk_rollout_pct          CHECK (rollout_percentage BETWEEN 0 AND 100);

-- ============================================================
-- Automatic updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'users','roles','permissions','workspaces','projects','storyboards',
            'scenes','characters','video_jobs','video_assets','plans','subscriptions',
            'payments','ai_providers','webhooks','feature_flags','support_tickets'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_set_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            tbl
        );
    END LOOP;
END;
$$;

-- ============================================================
-- Materialized view: provider performance dashboard
-- ============================================================
CREATE MATERIALIZED VIEW mv_provider_stats AS
SELECT
    rl.provider_name,
    COUNT(*)                                             AS total_attempts,
    COUNT(*) FILTER (WHERE rl.was_successful = true)    AS successful,
    COUNT(*) FILTER (WHERE rl.was_successful = false)   AS failed,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE rl.was_successful = true) / NULLIF(COUNT(*), 0), 2
    )                                                    AS success_rate_pct,
    ROUND(AVG(rl.response_time_ms))                     AS avg_response_ms,
    MAX(rl.created_at)                                   AS last_used_at
FROM routing_logs rl
WHERE rl.was_selected = true
GROUP BY rl.provider_name;

CREATE UNIQUE INDEX idx_mv_provider_stats ON mv_provider_stats(provider_name);

-- Refresh this view via scheduled job every hour
-- (handled by Spring @Scheduled in ProviderStatsService)

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON TABLE users              IS 'Platform users. Supports LOCAL, GOOGLE, GITHUB auth providers.';
COMMENT ON TABLE video_jobs         IS 'Async video generation jobs. Status: QUEUED→PROCESSING→COMPLETED|FAILED.';
COMMENT ON TABLE ai_providers       IS 'AI provider registry. New providers are added here without code changes.';
COMMENT ON TABLE routing_logs       IS 'AI router decision audit trail for analysis and improvement.';
COMMENT ON TABLE credit_transactions IS 'Immutable credit ledger. Never delete rows; only append.';
COMMENT ON TABLE analytics_events   IS 'User behavior events. Partitioned by month for performance.';
COMMENT ON MATERIALIZED VIEW mv_provider_stats IS 'Cached provider performance metrics. Refresh hourly.';
