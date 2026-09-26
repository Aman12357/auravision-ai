package com.aura.video.entity;

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
