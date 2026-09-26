package com.aura.video.entity;

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
