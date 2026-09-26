package com.aura.video.entity;

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

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String negativePrompt;

    @Builder.Default
    private int durationSeconds = 5;

    @Column(length = 20)
    private String resolution;

    @Column(length = 20)
    private String aspectRatio;

    @Column(length = 50)
    private String preferredProvider;

    @Column(length = 50)
    private String routingStrategy;

    @Column(columnDefinition = "TEXT")
    private String videoUrl;

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
