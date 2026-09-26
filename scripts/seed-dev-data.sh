#!/bin/bash
set -e

if [ "$SPRING_PROFILES_ACTIVE" == "production" ]; then
    echo "ERROR: Cannot run seeder in production environment!"
    exit 1
fi

echo "Seeding development data..."
# Use PGPASSWORD to bypass password prompt
export PGPASSWORD=aura_password

psql -h localhost -U aura_user -d aura -c "
INSERT INTO users (id, email, password_hash, role) VALUES ('user1', 'admin@aura.ai', 'hashed_pwd_admin', 'ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO users (id, email, password_hash, role) VALUES ('user2', 'user@aura.ai', 'hashed_pwd_user', 'USER') ON CONFLICT DO NOTHING;

-- Workspaces
INSERT INTO workspaces (id, name, owner_id) VALUES ('ws1', 'Admin Workspace', 'user1') ON CONFLICT DO NOTHING;

-- Jobs
INSERT INTO jobs (id, workspace_id, status) VALUES ('job1', 'ws1', 'COMPLETED') ON CONFLICT DO NOTHING;
"

echo "Data seeding complete."
