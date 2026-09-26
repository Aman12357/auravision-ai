CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50),
    action VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(500),
    phone_number VARCHAR(20),
    email_verified BOOLEAN DEFAULT false NOT NULL,
    phone_verified BOOLEAN DEFAULT false NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
    account_locked BOOLEAN DEFAULT false NOT NULL,
    account_expired BOOLEAN DEFAULT false NOT NULL,
    login_attempts INT DEFAULT 0 NOT NULL,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    auth_provider VARCHAR(20) DEFAULT 'LOCAL' NOT NULL,
    provider_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System Administrator with full access'),
    ('MODERATOR', 'System Moderator with content management access'),
    ('USER', 'Standard User'),
    ('DEVELOPER', 'Developer with API access'),
    ('ENTERPRISE', 'Enterprise User with advanced features');

-- Insert permissions
INSERT INTO permissions (name, description, resource, action) VALUES
    ('VIDEO_VIEW', 'View videos', 'VIDEO', 'VIEW'),
    ('VIDEO_GENERATE', 'Generate videos', 'VIDEO', 'GENERATE'),
    ('VIDEO_DELETE', 'Delete videos', 'VIDEO', 'DELETE'),
    ('VIDEO_DOWNLOAD', 'Download videos', 'VIDEO', 'DOWNLOAD'),
    ('TEMPLATE_USE', 'Use templates', 'TEMPLATE', 'USE'),
    ('TEMPLATE_CREATE', 'Create templates', 'TEMPLATE', 'CREATE'),
    ('TEMPLATE_DELETE', 'Delete templates', 'TEMPLATE', 'DELETE'),
    ('WORKSPACE_MANAGE', 'Manage workspaces', 'WORKSPACE', 'MANAGE'),
    ('TEAM_MANAGE', 'Manage teams', 'TEAM', 'MANAGE'),
    ('BILLING_VIEW', 'View billing information', 'BILLING', 'VIEW'),
    ('BILLING_MANAGE', 'Manage billing information', 'BILLING', 'MANAGE'),
    ('ADMIN_ACCESS', 'Admin dashboard access', 'ADMIN', 'ACCESS'),
    ('ADMIN_USERS', 'Manage users', 'ADMIN', 'USERS'),
    ('ADMIN_ANALYTICS', 'View admin analytics', 'ADMIN', 'ANALYTICS'),
    ('ADMIN_PROVIDERS', 'Manage AI providers', 'ADMIN', 'PROVIDERS'),
    ('API_KEY_CREATE', 'Create API keys', 'API_KEY', 'CREATE'),
    ('API_KEY_DELETE', 'Delete API keys', 'API_KEY', 'DELETE');

-- Assign basic permissions to USER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'USER' AND p.name IN ('VIDEO_VIEW', 'VIDEO_GENERATE', 'VIDEO_DELETE', 'VIDEO_DOWNLOAD', 'TEMPLATE_USE', 'WORKSPACE_MANAGE');

-- Assign all permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN';

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_auth_provider_provider_id ON users(auth_provider, provider_id);
