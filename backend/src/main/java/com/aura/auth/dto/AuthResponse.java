package com.aura.auth.dto;

import com.aura.user.dto.UserDto;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn,
    UserDto user,
    boolean requiresTwoFactor,
    String twoFactorToken
) {}
