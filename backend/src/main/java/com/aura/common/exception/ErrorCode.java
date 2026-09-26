package com.aura.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    // Auth Errors (AUTH_001 to AUTH_020)
    AUTH_001(HttpStatus.UNAUTHORIZED, "Invalid credentials"),
    AUTH_002(HttpStatus.UNAUTHORIZED, "Token expired"),
    AUTH_003(HttpStatus.UNAUTHORIZED, "Invalid token"),
    AUTH_004(HttpStatus.FORBIDDEN, "Account locked"),
    AUTH_005(HttpStatus.BAD_REQUEST, "OTP expired"),
    AUTH_006(HttpStatus.BAD_REQUEST, "Invalid OTP"),
    AUTH_007(HttpStatus.FORBIDDEN, "2FA required"),
    AUTH_008(HttpStatus.UNAUTHORIZED, "Authentication required"),
    AUTH_020(HttpStatus.UNAUTHORIZED, "Unknown authentication error"),

    // User Errors (USER_001 to USER_010)
    USER_001(HttpStatus.NOT_FOUND, "User not found"),
    USER_002(HttpStatus.CONFLICT, "Email already exists"),
    USER_003(HttpStatus.CONFLICT, "Username already exists"),
    USER_010(HttpStatus.BAD_REQUEST, "Invalid user operation"),

    // Video Errors (VIDEO_001 to VIDEO_020)
    VIDEO_001(HttpStatus.NOT_FOUND, "Video not found"),
    VIDEO_002(HttpStatus.INTERNAL_SERVER_ERROR, "Video generation failed"),
    VIDEO_003(HttpStatus.BAD_REQUEST, "Invalid video format"),
    VIDEO_004(HttpStatus.FORBIDDEN, "Quota exceeded"),
    VIDEO_020(HttpStatus.BAD_REQUEST, "Invalid video operation"),

    // Payment Errors (PAYMENT_001 to PAYMENT_010)
    PAYMENT_001(HttpStatus.BAD_REQUEST, "Payment processing failed"),
    PAYMENT_002(HttpStatus.PAYMENT_REQUIRED, "Insufficient funds"),
    PAYMENT_010(HttpStatus.BAD_REQUEST, "Invalid payment operation"),

    // AI Errors (AI_001 to AI_010)
    AI_001(HttpStatus.SERVICE_UNAVAILABLE, "No AI provider available"),
    AI_002(HttpStatus.SERVICE_UNAVAILABLE, "All AI providers failed"),
    AI_010(HttpStatus.INTERNAL_SERVER_ERROR, "AI service error"),

    // Storage Errors (STORAGE_001 to STORAGE_005)
    STORAGE_001(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed"),
    STORAGE_002(HttpStatus.NOT_FOUND, "File not found"),
    STORAGE_003(HttpStatus.INTERNAL_SERVER_ERROR, "File deletion failed"),
    STORAGE_005(HttpStatus.INTERNAL_SERVER_ERROR, "Storage error"),

    // Common Errors (COMMON_001 to COMMON_010)
    COMMON_001(HttpStatus.BAD_REQUEST, "Validation failed"),
    COMMON_002(HttpStatus.NOT_FOUND, "Resource not found"),
    COMMON_003(HttpStatus.FORBIDDEN, "Access denied"),
    COMMON_004(HttpStatus.BAD_REQUEST, "Invalid input"),
    COMMON_005(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    COMMON_010(HttpStatus.BAD_REQUEST, "General error"),

    // Aliases
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid credentials"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    INVALID_OTP(HttpStatus.BAD_REQUEST, "Invalid OTP"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");

    private final HttpStatus httpStatus;
    private final String defaultMessage;
}
