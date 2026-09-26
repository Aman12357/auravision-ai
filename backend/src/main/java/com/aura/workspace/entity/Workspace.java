package com.aura.workspace.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name="workspaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Workspace extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Builder.Default
    @Column(length = 30)
    private String plan = "FREE";

    @Builder.Default
    private Long creditsBalance = 0L;

    @Builder.Default
    private Long storageUsedBytes = 0L;

    @Builder.Default
    private Long storageLimitBytes = 5368709120L;

    @OneToMany(mappedBy = "workspace")
    private List<WorkspaceMember> members;
}
