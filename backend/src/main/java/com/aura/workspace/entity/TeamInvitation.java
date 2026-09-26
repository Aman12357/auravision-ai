package com.aura.workspace.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name="team_invitations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TeamInvitation extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id")
    private User invitedBy;

    @Column(length = 255)
    private String email;

    @Column(length = 30)
    private String role;

    @Column(length = 255, unique = true)
    private String token;

    private ZonedDateTime expiresAt;

    private ZonedDateTime acceptedAt;

    @Builder.Default
    @Column(length = 20)
    private String status = "PENDING";
}
