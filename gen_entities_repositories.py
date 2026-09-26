import os

base_path = r'C:\Users\ay670\.gemini\antigravity\scratch\aura-video-ai\backend\src\main\java\com\aura'

files = {
    'video/entity/JobStatus.java': '''package com.aura.video.entity;

public enum JobStatus {
    QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED
}
''',
    'video/entity/JobType.java': '''package com.aura.video.entity;

public enum JobType {
    TEXT_TO_VIDEO, IMAGE_TO_VIDEO, VIDEO_TO_VIDEO, UPSCALE, VOICE_OVER, SUBTITLE_GENERATION, MUSIC_GENERATION
}
''',
    'video/entity/AssetType.java': '''package com.aura.video.entity;

public enum AssetType {
    VIDEO, IMAGE, AUDIO, SUBTITLE, THUMBNAIL
}
''',
    'video/entity/ProjectStatus.java': '''package com.aura.video.entity;

public enum ProjectStatus {
    DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED
}
''',
    'video/entity/Project.java': '''package com.aura.video.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import com.aura.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;

@Entity
@Table(name="projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Project extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String thumbnailUrl;

    @ElementCollection
    private List<String> tags;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String settings;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VideoJob> jobs;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Storyboard> storyboards;
}
''',
    'video/entity/Storyboard.java': '''package com.aura.video.entity;

import com.aura.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name="storyboards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Storyboard extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer totalDuration;

    @Column(length = 30)
    private String status;

    @OneToMany(mappedBy = "storyboard", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sceneIndex ASC")
    private List<Scene> scenes;
}
''',
    'video/entity/Scene.java': '''package com.aura.video.entity;

import com.aura.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name="scenes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Scene extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "storyboard_id")
    private Storyboard storyboard;

    @Column(nullable = false)
    private Integer sceneIndex;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String negativePrompt;

    @Builder.Default
    private Integer duration = 5;

    @Builder.Default
    private Integer fps = 24;

    @Builder.Default
    @Column(length = 20)
    private String resolution = "1920x1080";

    @Builder.Default
    @Column(length = 10)
    private String aspectRatio = "16:9";

    @Column(length = 50)
    private String cameraMotion;

    @Column(length = 50)
    private String lighting;

    @Column(length = 50)
    private String style;

    @Column(length = 50)
    private String mood;

    @Column(columnDefinition = "TEXT")
    private String environment;

    @Column(length = 30)
    private String weather;

    private Long seed;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String voiceConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String musicConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String effectsConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String transitionConfig;

    @Builder.Default
    @Column(length = 30)
    private String status = "PENDING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_asset_id")
    private VideoAsset generatedAsset;
}
''',
    'video/entity/Character.java': '''package com.aura.video.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name="characters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Character extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String referenceImageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String faceEmbedding;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String attributes;
}
''',
    'video/entity/VideoJob.java': '''package com.aura.video.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import com.aura.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name="video_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VideoJob extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id")
    private Scene scene;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.QUEUED;

    @Builder.Default
    private Integer priority = 5;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String inputData;

    @Column(length = 50)
    private String providerUsed;

    @Column(length = 255)
    private String providerJobId;

    private Integer estimatedCostCredits;

    private Integer actualCostCredits;

    @Builder.Default
    private Integer progressPercent = 0;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Builder.Default
    private Integer retryCount = 0;

    @Builder.Default
    private Integer maxRetries = 3;

    @Builder.Default
    private ZonedDateTime queuedAt = ZonedDateTime.now();

    private ZonedDateTime startedAt;

    private ZonedDateTime completedAt;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    private List<VideoAsset> assets;
}
''',
    'video/entity/VideoAsset.java': '''package com.aura.video.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import com.aura.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name="video_assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VideoAsset extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private VideoJob job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String storageKey;

    @Column(columnDefinition = "TEXT")
    private String cdnUrl;

    private Long fileSizeBytes;

    @Column(precision = 10, scale = 2)
    private BigDecimal durationSeconds;

    @Column(length = 20)
    private String resolution;

    @Column(length = 20)
    private String format;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    private ZonedDateTime expiresAt;

    @Builder.Default
    private Integer downloadCount = 0;
}
''',
    'video/repository/ProjectRepository.java': '''package com.aura.video.repository;

import com.aura.video.entity.Project;
import com.aura.video.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findByWorkspaceIdAndStatus(UUID workspaceId, ProjectStatus status, Pageable pageable);
    Page<Project> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    Page<Project> findByUserId(UUID userId, Pageable pageable);
    
    @Query("SELECT p FROM Project p WHERE p.workspace.id = :workspaceId AND p.name ILIKE %:name%")
    Page<Project> searchByName(@Param("workspaceId") UUID workspaceId, @Param("name") String name, Pageable pageable);
    
    long countByWorkspaceId(UUID workspaceId);
}
''',
    'video/repository/VideoJobRepository.java': '''package com.aura.video.repository;

import com.aura.video.entity.VideoJob;
import com.aura.video.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface VideoJobRepository extends JpaRepository<VideoJob, UUID> {
    Page<VideoJob> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    Page<VideoJob> findByUserId(UUID userId, Pageable pageable);
    Page<VideoJob> findByWorkspaceIdAndStatus(UUID workspaceId, JobStatus status, Pageable pageable);
    List<VideoJob> findByStatusInAndRetryCountLessThan(List<JobStatus> statuses, int maxRetries);
    long countByWorkspaceIdAndStatus(UUID workspaceId, JobStatus status);
    
    @Query("SELECT SUM(j.actualCostCredits) FROM VideoJob j WHERE j.workspace.id = :wid AND j.status = 'COMPLETED' AND j.completedAt > :since")
    Long sumCreditsByWorkspaceSince(@Param("wid") UUID wid, @Param("since") ZonedDateTime since);
}
''',
    'video/repository/VideoAssetRepository.java': '''package com.aura.video.repository;

import com.aura.video.entity.VideoAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VideoAssetRepository extends JpaRepository<VideoAsset, UUID> {
    Page<VideoAsset> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    List<VideoAsset> findByJobId(UUID jobId);
    
    @Query("SELECT SUM(a.fileSizeBytes) FROM VideoAsset a WHERE a.workspace.id = :workspaceId")
    Long sumFileSizeBytesByWorkspaceId(@Param("workspaceId") UUID workspaceId);
}
''',
    'video/repository/StoryboardRepository.java': '''package com.aura.video.repository;

import com.aura.video.entity.Storyboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StoryboardRepository extends JpaRepository<Storyboard, UUID> {
    List<Storyboard> findByProjectId(UUID projectId);
}
''',
    'video/repository/SceneRepository.java': '''package com.aura.video.repository;

import com.aura.video.entity.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SceneRepository extends JpaRepository<Scene, UUID> {
    List<Scene> findByStoryboardIdOrderBySceneIndexAsc(UUID storyboardId);
}
''',
    'video/repository/CharacterRepository.java': '''package com.aura.video.repository;

import com.aura.video.entity.Character;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CharacterRepository extends JpaRepository<Character, UUID> {
    Page<Character> findByWorkspaceId(UUID workspaceId, Pageable pageable);
}
'''
}

for filepath, content in files.items():
    full_path = os.path.join(base_path, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Created {len(files)} files successfully.")
