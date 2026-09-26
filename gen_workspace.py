import os

base_path = r'C:\Users\ay670\.gemini\antigravity\scratch\aura-video-ai\backend\src\main\java\com\aura'

files = {
    # WORKSPACE ENTITIES
    'workspace/entity/WorkspaceMemberRole.java': '''package com.aura.workspace.entity;

public enum WorkspaceMemberRole {
    OWNER, ADMIN, EDITOR, VIEWER
}
''',
    'workspace/entity/Workspace.java': '''package com.aura.workspace.entity;

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
''',
    'workspace/entity/WorkspaceMember.java': '''package com.aura.workspace.entity;

import com.aura.common.entity.BaseEntity;
import com.aura.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name="workspace_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WorkspaceMember extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private WorkspaceMemberRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id")
    private User invitedBy;

    @Builder.Default
    private ZonedDateTime joinedAt = ZonedDateTime.now();
}
''',
    'workspace/entity/TeamInvitation.java': '''package com.aura.workspace.entity;

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
''',
    # WORKSPACE REPOSITORIES
    'workspace/repository/WorkspaceRepository.java': '''package com.aura.workspace.repository;

import com.aura.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    List<Workspace> findByOwnerId(UUID ownerId);
    Optional<Workspace> findBySlug(String slug);
    boolean existsBySlug(String slug);
    
    @Query("SELECT w FROM Workspace w JOIN w.members m WHERE m.user.id = :userId")
    List<Workspace> findWorkspacesByUserId(@Param("userId") UUID userId);
}
''',
    'workspace/repository/WorkspaceMemberRepository.java': '''package com.aura.workspace.repository;

import com.aura.workspace.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    void deleteByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
''',
    'workspace/repository/TeamInvitationRepository.java': '''package com.aura.workspace.repository;

import com.aura.workspace.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {
    Optional<TeamInvitation> findByToken(String token);
    List<TeamInvitation> findByEmailAndStatus(String email, String status);
}
''',
    # WORKSPACE DTOs
    'workspace/dto/WorkspaceDto.java': '''package com.aura.workspace.dto;
import com.aura.workspace.entity.Workspace;
import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkspaceDto(
    UUID id, String name, String slug, String description, String avatarUrl,
    String plan, Long creditsBalance, Long storageUsedBytes, Long storageLimitBytes,
    int memberCount, UUID ownerId, ZonedDateTime createdAt
) {
    public static WorkspaceDto fromWorkspace(Workspace w) {
        return new WorkspaceDto(
            w.getId(), w.getName(), w.getSlug(), w.getDescription(), w.getAvatarUrl(),
            w.getPlan(), w.getCreditsBalance(), w.getStorageUsedBytes(), w.getStorageLimitBytes(),
            w.getMembers() != null ? w.getMembers().size() : 0,
            w.getOwner() != null ? w.getOwner().getId() : null,
            w.getCreatedAt()
        );
    }
}
''',
    'workspace/dto/CreateWorkspaceRequest.java': '''package com.aura.workspace.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWorkspaceRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 500) String description
) {}
''',
    'workspace/dto/InviteMemberRequest.java': '''package com.aura.workspace.dto;
import com.aura.workspace.entity.WorkspaceMemberRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteMemberRequest(
    @Email @NotBlank String email,
    @NotNull WorkspaceMemberRole role
) {}
''',
    'workspace/dto/CreditTransactionDto.java': '''package com.aura.workspace.dto;
import java.time.ZonedDateTime;
import java.util.UUID;

public record CreditTransactionDto(
    UUID id, String type, long amount, long balanceAfter,
    String description, String referenceId, String referenceType, ZonedDateTime createdAt
) {}
''',
    'workspace/dto/WorkspaceMemberDto.java': '''package com.aura.workspace.dto;
import com.aura.workspace.entity.WorkspaceMemberRole;
import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkspaceMemberDto(
    UUID id, UUID userId, String email, String fullName,
    String avatarUrl, WorkspaceMemberRole role, ZonedDateTime joinedAt
) {}
''',
    # WORKSPACE SERVICES
    'workspace/service/WorkspaceService.java': '''package com.aura.workspace.service;

import com.aura.user.entity.User;
import com.aura.user.repository.UserRepository;
import com.aura.workspace.dto.*;
import com.aura.workspace.entity.*;
import com.aura.workspace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final UserRepository userRepository;

    public WorkspaceDto createWorkspace(UUID userId, CreateWorkspaceRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        String slug = request.name().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        if (workspaceRepository.existsBySlug(slug)) {
            slug += "-" + UUID.randomUUID().toString().substring(0, 5);
        }
        
        Workspace workspace = Workspace.builder()
                .name(request.name())
                .description(request.description())
                .slug(slug)
                .owner(user)
                .build();
        Workspace saved = workspaceRepository.save(workspace);
        
        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(saved)
                .user(user)
                .role(WorkspaceMemberRole.OWNER)
                .build();
        workspaceMemberRepository.save(member);
        
        return WorkspaceDto.fromWorkspace(saved);
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspace(UUID workspaceId, UUID userId) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new RuntimeException("Access denied");
        }
        return WorkspaceDto.fromWorkspace(workspaceRepository.findById(workspaceId).orElseThrow());
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(UUID userId) {
        return workspaceRepository.findWorkspacesByUserId(userId).stream()
                .map(WorkspaceDto::fromWorkspace).collect(Collectors.toList());
    }

    public WorkspaceDto updateWorkspace(UUID workspaceId, UUID userId, CreateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        workspace.setName(request.name());
        workspace.setDescription(request.description());
        return WorkspaceDto.fromWorkspace(workspaceRepository.save(workspace));
    }

    public void inviteMember(UUID workspaceId, UUID userId, InviteMemberRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        User inviter = userRepository.findById(userId).orElseThrow();
        
        TeamInvitation invitation = TeamInvitation.builder()
                .workspace(workspace)
                .invitedBy(inviter)
                .email(request.email())
                .role(request.role().name())
                .token(UUID.randomUUID().toString())
                .expiresAt(ZonedDateTime.now().plusDays(7))
                .build();
        teamInvitationRepository.save(invitation);
    }

    public WorkspaceDto acceptInvitation(String token, UUID userId) {
        TeamInvitation invitation = teamInvitationRepository.findByToken(token).orElseThrow();
        if (invitation.getExpiresAt().isBefore(ZonedDateTime.now())) {
            throw new RuntimeException("Invitation expired");
        }
        User user = userRepository.findById(userId).orElseThrow();
        Workspace workspace = invitation.getWorkspace();
        
        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(WorkspaceMemberRole.valueOf(invitation.getRole()))
                .build();
        workspaceMemberRepository.save(member);
        
        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(ZonedDateTime.now());
        teamInvitationRepository.save(invitation);
        
        return WorkspaceDto.fromWorkspace(workspace);
    }

    public void removeMember(UUID workspaceId, UUID targetUserId, UUID requesterId) {
        workspaceMemberRepository.deleteByWorkspaceIdAndUserId(workspaceId, targetUserId);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> getMembers(UUID workspaceId, UUID userId) {
        return workspaceMemberRepository.findByWorkspaceId(workspaceId).stream()
                .map(m -> new WorkspaceMemberDto(
                        m.getId(), m.getUser().getId(), m.getUser().getEmail(), 
                        m.getUser().getFullName(), null, m.getRole(), m.getJoinedAt()
                )).collect(Collectors.toList());
    }
}
''',
    'workspace/service/CreditService.java': '''package com.aura.workspace.service;

import com.aura.video.dto.VideoGenerationRequest;
import com.aura.workspace.dto.CreditTransactionDto;
import com.aura.workspace.entity.Workspace;
import com.aura.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreditService {
    private final WorkspaceRepository workspaceRepository;

    @Transactional(readOnly = true)
    public long getBalance(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId).map(Workspace::getCreditsBalance).orElse(0L);
    }

    public void debitCredits(UUID workspaceId, UUID userId, long amount, String description, String refId, String refType) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        if (workspace.getCreditsBalance() < amount) {
            throw new RuntimeException("Insufficient credits");
        }
        workspace.setCreditsBalance(workspace.getCreditsBalance() - amount);
        workspaceRepository.save(workspace);
        // Normally insert into a credit_transactions table here
    }

    public void creditCredits(UUID workspaceId, UUID userId, long amount, String type, String description, String refId) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        workspace.setCreditsBalance(workspace.getCreditsBalance() + amount);
        workspaceRepository.save(workspace);
    }

    @Transactional(readOnly = true)
    public Page<CreditTransactionDto> getTransactionHistory(UUID workspaceId, Pageable pageable) {
        return Page.empty(); // Stub
    }

    public int estimateJobCost(VideoGenerationRequest request) {
        // Simple mock estimation logic
        int base = 10;
        int durationFactor = request.duration() != null ? request.duration() : 5;
        return base * durationFactor;
    }
}
''',
    # WORKSPACE CONTROLLERS
    'workspace/controller/WorkspaceController.java': '''package com.aura.workspace.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.entity.User;
import com.aura.workspace.dto.CreateWorkspaceRequest;
import com.aura.workspace.dto.InviteMemberRequest;
import com.aura.workspace.dto.WorkspaceDto;
import com.aura.workspace.dto.WorkspaceMemberDto;
import com.aura.workspace.service.WorkspaceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
@Tag(name="Workspaces")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @PostMapping
    public ApiResponse<WorkspaceDto> createWorkspace(@AuthenticationPrincipal User user,
                                                     @Valid @RequestBody CreateWorkspaceRequest request) {
        return ApiResponse.success(workspaceService.createWorkspace(user.getId(), request));
    }

    @GetMapping
    public ApiResponse<List<WorkspaceDto>> getUserWorkspaces(@AuthenticationPrincipal User user) {
        return ApiResponse.success(workspaceService.getUserWorkspaces(user.getId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkspaceDto> getWorkspace(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ApiResponse.success(workspaceService.getWorkspace(id, user.getId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkspaceDto> updateWorkspace(@PathVariable UUID id,
                                                     @AuthenticationPrincipal User user,
                                                     @Valid @RequestBody CreateWorkspaceRequest request) {
        return ApiResponse.success(workspaceService.updateWorkspace(id, user.getId(), request));
    }

    @GetMapping("/{id}/members")
    public ApiResponse<List<WorkspaceMemberDto>> getMembers(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ApiResponse.success(workspaceService.getMembers(id, user.getId()));
    }

    @PostMapping("/{id}/members/invite")
    public ApiResponse<Void> inviteMember(@PathVariable UUID id,
                                          @AuthenticationPrincipal User user,
                                          @Valid @RequestBody InviteMemberRequest request) {
        workspaceService.inviteMember(id, user.getId(), request);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ApiResponse<Void> removeMember(@PathVariable UUID id,
                                          @PathVariable UUID userId,
                                          @AuthenticationPrincipal User user) {
        workspaceService.removeMember(id, userId, user.getId());
        return ApiResponse.success(null);
    }

    @PostMapping("/invitations/{token}/accept")
    public ApiResponse<WorkspaceDto> acceptInvitation(@PathVariable String token, @AuthenticationPrincipal User user) {
        return ApiResponse.success(workspaceService.acceptInvitation(token, user.getId()));
    }
}
''',
    'workspace/controller/CreditController.java': '''package com.aura.workspace.controller;

import com.aura.common.response.ApiResponse;
import com.aura.video.dto.VideoGenerationRequest;
import com.aura.workspace.dto.CreditTransactionDto;
import com.aura.workspace.service.CreditService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/credits")
@Tag(name="Credits")
@RequiredArgsConstructor
public class CreditController {
    private final CreditService creditService;

    @GetMapping("/balance")
    public ApiResponse<Long> getBalance(@RequestHeader("X-Workspace-Id") UUID workspaceId) {
        return ApiResponse.success(creditService.getBalance(workspaceId));
    }

    @GetMapping("/transactions")
    public ApiResponse<Page<CreditTransactionDto>> getTransactionHistory(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                                         Pageable pageable) {
        return ApiResponse.success(creditService.getTransactionHistory(workspaceId, pageable));
    }

    @PostMapping("/estimate")
    public ApiResponse<Integer> estimateJobCost(@RequestBody VideoGenerationRequest request) {
        return ApiResponse.success(creditService.estimateJobCost(request));
    }
}
'''
}

for filepath, content in files.items():
    full_path = os.path.join(base_path, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Created {len(files)} files successfully.")
