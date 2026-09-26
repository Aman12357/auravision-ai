package com.aura.workspace.controller;

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
