-- ============================================================
-- V6: Workspace Teams, Notifications, Invitations, Feature Flags, Support
-- ============================================================

-- User notifications
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,   -- VIDEO_COMPLETE, PAYMENT_SUCCESS, TEAM_INVITE, etc.
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    data        JSONB       NOT NULL DEFAULT '{}',
    read        BOOLEAN     NOT NULL DEFAULT false,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);

-- Team invitations
CREATE TABLE team_invitations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invited_by   UUID        NOT NULL REFERENCES users(id),
    email        VARCHAR(255) NOT NULL,
    role         VARCHAR(30) NOT NULL DEFAULT 'MEMBER'
                 CHECK (role IN ('ADMIN','EDITOR','VIEWER','MEMBER')),
    token        VARCHAR(255) UNIQUE NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    accepted_at  TIMESTAMPTZ,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','ACCEPTED','DECLINED','EXPIRED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_invitations_workspace ON team_invitations(workspace_id, status);
CREATE INDEX idx_team_invitations_email     ON team_invitations(email, status);
CREATE INDEX idx_team_invitations_token     ON team_invitations(token);

-- Feature flags (LaunchDarkly-compatible structure)
CREATE TABLE feature_flags (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) UNIQUE NOT NULL,
    description         TEXT,
    enabled             BOOLEAN     NOT NULL DEFAULT false,
    rollout_percentage  INTEGER     NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    allowed_roles       TEXT[]      NOT NULL DEFAULT '{}',
    allowed_plan_ids    TEXT[]      NOT NULL DEFAULT '{}',
    metadata            JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support tickets
CREATE TABLE support_tickets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID        REFERENCES workspaces(id) ON DELETE SET NULL,
    user_id      UUID        NOT NULL REFERENCES users(id),
    subject      VARCHAR(300) NOT NULL,
    status       VARCHAR(30) NOT NULL DEFAULT 'OPEN'
                 CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
    priority     VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
                 CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    category     VARCHAR(50),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);

CREATE INDEX idx_tickets_user      ON support_tickets(user_id, created_at DESC);
CREATE INDEX idx_tickets_status    ON support_tickets(status, priority);

-- Support ticket messages / thread
CREATE TABLE support_ticket_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID    NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id     UUID    REFERENCES users(id) ON DELETE SET NULL,
    is_staff    BOOLEAN NOT NULL DEFAULT false,
    message     TEXT    NOT NULL,
    attachments JSONB   NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON support_ticket_messages(ticket_id, created_at ASC);

-- ============================================================
-- Seed feature flags
-- ============================================================
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, allowed_roles, allowed_plan_ids)
VALUES
    ('AI_DIRECTOR',           'AI Director for fully automated video production',  false, 0,   ARRAY['ADMIN'],                 '{}'),
    ('CHARACTER_CONSISTENCY', 'Cross-scene character identity preservation',        false, 0,   ARRAY['ADMIN','ENTERPRISE'],    '{}'),
    ('VIDEO_UPSCALE_8K',      '8K video upscaling (requires high-tier plan)',       false, 0,   ARRAY['ADMIN'],                 '{}'),
    ('VOICE_CLONING',         'Custom voice cloning feature',                       false, 0,   ARRAY['ADMIN','ENTERPRISE'],    '{}'),
    ('API_ACCESS',            'Developer API access',                               true,  100, ARRAY['DEVELOPER','ENTERPRISE'],'{}'),
    ('TEAM_COLLABORATION',    'Multi-member workspace collaboration',               true,  100, '{}',                           '{}'),
    ('DARK_MODE',             'Dark mode UI',                                       true,  100, '{}',                           '{}');
