package com.aura.video.entity;

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
