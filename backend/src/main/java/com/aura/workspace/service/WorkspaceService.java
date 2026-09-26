package com.aura.workspace.service;

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
