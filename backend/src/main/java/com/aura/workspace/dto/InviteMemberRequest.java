package com.aura.workspace.dto;
import com.aura.workspace.entity.WorkspaceMemberRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteMemberRequest(
    @Email @NotBlank String email,
    @NotNull WorkspaceMemberRole role
) {}
