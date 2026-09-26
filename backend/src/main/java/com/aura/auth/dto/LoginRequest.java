package com.aura.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Username or email is required")
    String emailOrUsername,
    
    @NotBlank(message = "Password is required")
    String password,
    
    boolean rememberMe,
    
    String deviceInfo
) {}
