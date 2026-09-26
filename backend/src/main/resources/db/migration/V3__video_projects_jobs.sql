CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    plan VARCHAR(30) DEFAULT 'FREE' NOT NULL,
    credits_balance BIGINT DEFAULT 0 NOT NULL,
    storage_used_bytes BIGINT DEFAULT 0 NOT NULL,
    storage_limit_bytes BIGINT DEFAULT 5368709120 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'MEMBER' NOT NULL,
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (workspace_id, user_id)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'DRAFT' NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE storyboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    total_duration INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyboard_id UUID NOT NULL REFERENCES storyboards(id) ON DELETE CASCADE,
    scene_index INTEGER NOT NULL,
    title VARCHAR(200),
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    duration INTEGER DEFAULT 5,
    fps INTEGER DEFAULT 24,
    resolution VARCHAR(20) DEFAULT '1920x1080',
    aspect_ratio VARCHAR(10) DEFAULT '16:9',
    camera_motion VARCHAR(50),
    lighting VARCHAR(50),
    style VARCHAR(50),
    mood VARCHAR(50),
    environment TEXT,
    weather VARCHAR(30),
    seed BIGINT,
    voice_config JSONB,
    music_config JSONB,
    effects_config JSONB,
    transition_config JSONB,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    reference_image_url TEXT,
    face_embedding JSONB,
    attributes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE video_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    scene_id UUID REFERENCES scenes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    job_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'QUEUED' NOT NULL,
    priority INTEGER DEFAULT 5,
    input_data JSONB NOT NULL,
    provider_used VARCHAR(50),
    provider_job_id VARCHAR(255),
    estimated_cost_credits INTEGER,
    actual_cost_credits INTEGER,
    progress_percent INTEGER DEFAULT 0,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    queued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_video_jobs_user_id ON video_jobs(user_id);
CREATE INDEX idx_video_jobs_workspace_id ON video_jobs(workspace_id);
CREATE INDEX idx_video_jobs_status ON video_jobs(status);
CREATE INDEX idx_video_jobs_created_at ON video_jobs(created_at DESC);

CREATE TABLE video_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    user_id UUID NOT NULL REFERENCES users(id),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    asset_type VARCHAR(30) NOT NULL,
    storage_key TEXT NOT NULL,
    cdn_url TEXT,
    file_size_bytes BIGINT,
    duration_seconds DECIMAL(10,2),
    resolution VARCHAR(20),
    format VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
