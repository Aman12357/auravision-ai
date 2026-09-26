-- ============================================================
-- V4: Payment Plans, Subscriptions, Credits, Invoices, Coupons
-- ============================================================

-- Subscription plans
CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    display_name    VARCHAR(100),
    description     TEXT,
    price_monthly   DECIMAL(10,2)   NOT NULL DEFAULT 0,
    price_yearly    DECIMAL(10,2)   NOT NULL DEFAULT 0,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'USD',
    credits_monthly INTEGER         NOT NULL DEFAULT 0,
    max_resolution  VARCHAR(20)     NOT NULL DEFAULT '1080p',
    max_duration_seconds INTEGER    NOT NULL DEFAULT 30,
    max_team_members INTEGER        NOT NULL DEFAULT 1,
    storage_gb      INTEGER         NOT NULL DEFAULT 5,
    features        JSONB           NOT NULL DEFAULT '[]',
    stripe_monthly_price_id  VARCHAR(255),
    stripe_yearly_price_id   VARCHAR(255),
    razorpay_monthly_plan_id VARCHAR(255),
    razorpay_yearly_plan_id  VARCHAR(255),
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Active user/workspace subscriptions
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id            UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_id                 UUID        NOT NULL REFERENCES plans(id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE','CANCELLED','PAST_DUE','TRIALING','EXPIRED')),
    billing_cycle           VARCHAR(10) NOT NULL DEFAULT 'MONTHLY'
                            CHECK (billing_cycle IN ('MONTHLY','YEARLY')),
    current_period_start    TIMESTAMPTZ NOT NULL,
    current_period_end      TIMESTAMPTZ NOT NULL,
    trial_end               TIMESTAMPTZ,
    cancel_at_period_end    BOOLEAN     NOT NULL DEFAULT false,
    stripe_subscription_id  VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    paypal_subscription_id  VARCHAR(255),
    payment_provider        VARCHAR(20),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_workspace ON subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Credit wallet per workspace (one row per workspace)
CREATE TABLE credits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID    UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    balance         BIGINT  NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned BIGINT  NOT NULL DEFAULT 0,
    lifetime_spent  BIGINT  NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable credit ledger (append-only)
CREATE TABLE credit_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('PURCHASE','SUBSCRIPTION_GRANT','JOB_DEBIT','REFUND','BONUS','ADMIN_ADJUST')),
    amount          BIGINT      NOT NULL, -- positive = credit in, negative = debit
    balance_after   BIGINT      NOT NULL,
    description     TEXT,
    reference_id    VARCHAR(255),  -- job_id, payment_id, etc.
    reference_type  VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_workspace ON credit_transactions(workspace_id, created_at DESC);
CREATE INDEX idx_credit_tx_user ON credit_transactions(user_id, created_at DESC);

-- Payment records
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id             UUID        NOT NULL REFERENCES users(id),
    subscription_id     UUID        REFERENCES subscriptions(id),
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3)  NOT NULL DEFAULT 'USD',
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
    payment_provider    VARCHAR(20) NOT NULL
                        CHECK (payment_provider IN ('STRIPE','RAZORPAY','PAYPAL')),
    provider_payment_id VARCHAR(255),
    provider_charge_id  VARCHAR(255),
    metadata            JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_workspace ON payments(workspace_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);

-- Tax invoices
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    payment_id      UUID        REFERENCES payments(id),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate        DECIMAL(5,2)  NOT NULL DEFAULT 0,
    currency        VARCHAR(3)  NOT NULL DEFAULT 'USD',
    status          VARCHAR(20) NOT NULL DEFAULT 'ISSUED'
                    CHECK (status IN ('DRAFT','ISSUED','PAID','VOID')),
    pdf_url         TEXT,
    billing_address JSONB,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at          TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ
);

CREATE INDEX idx_invoices_workspace ON invoices(workspace_id, issued_at DESC);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Discount coupons
CREATE TABLE coupons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(50) UNIQUE NOT NULL,
    description         TEXT,
    discount_type       VARCHAR(20) NOT NULL
                        CHECK (discount_type IN ('PERCENTAGE','FIXED_AMOUNT','CREDITS')),
    discount_value      DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    min_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_uses            INTEGER,       -- NULL = unlimited
    uses_count          INTEGER NOT NULL DEFAULT 0,
    max_uses_per_user   INTEGER NOT NULL DEFAULT 1,
    valid_from          TIMESTAMPTZ NOT NULL,
    valid_until         TIMESTAMPTZ,
    applicable_plans    TEXT[]  NOT NULL DEFAULT '{}',
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = true;

-- Coupon redemption tracking
CREATE TABLE coupon_redemptions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id        UUID        NOT NULL REFERENCES coupons(id),
    workspace_id     UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id          UUID        NOT NULL REFERENCES users(id),
    payment_id       UUID        REFERENCES payments(id),
    discount_applied DECIMAL(10,2) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (coupon_id, workspace_id)  -- one redemption per coupon per workspace by default
);

-- ============================================================
-- Seed default plans
-- ============================================================
INSERT INTO plans (name, display_name, description, price_monthly, price_yearly, credits_monthly,
                   max_resolution, max_duration_seconds, max_team_members, storage_gb,
                   features, is_active, sort_order)
VALUES
    ('FREE',       'Free',       'Get started with AI video generation',
     0.00,   0.00,   50,   '720p',  15, 1,   5,
     '["5 videos/month","720p resolution","15s max duration","Community support"]'::jsonb, true, 1),

    ('STARTER',    'Starter',    'Perfect for individual creators',
     9.99,   99.99,  500,  '1080p', 60, 1,   20,
     '["50 videos/month","1080p resolution","60s max duration","Email support","No watermark"]'::jsonb, true, 2),

    ('PRO',        'Pro',        'For professional content creators',
     29.99,  299.99, 2000, '2K',    180, 5,  100,
     '["200 videos/month","2K resolution","3min max duration","Priority support","API access","Team collaboration"]'::jsonb, true, 3),

    ('ENTERPRISE', 'Enterprise', 'Enterprise-grade AI video at scale',
     99.99,  999.99, 10000,'4K',    600, 25, 1000,
     '["Unlimited videos","4K resolution","10min max duration","Dedicated support","Custom AI models","SSO","SLA guarantee"]'::jsonb, true, 4);
