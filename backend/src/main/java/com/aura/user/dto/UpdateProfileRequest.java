package com.aura.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "Full name cannot be blank")
    String fullName,
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    String bio,
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number must be in valid international format")
    String phoneNumber
) {}
