package com.aura.user.dto;

import com.aura.user.entity.User;
import java.time.ZonedDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserDto(
    UUID id,
    String email,
    String username,
    String fullName,
    String avatarUrl,
    String bio,
    boolean emailVerified,
    boolean twoFactorEnabled,
    Set<String> roles,
    ZonedDateTime createdAt
) {
    public static UserDto fromUser(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getUsername(),
            user.getFullName(),
            user.getAvatarUrl(),
            user.getBio(),
            user.isEmailVerified(),
            user.isTwoFactorEnabled(),
            user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()),
            user.getCreatedAt()
        );
    }
}
