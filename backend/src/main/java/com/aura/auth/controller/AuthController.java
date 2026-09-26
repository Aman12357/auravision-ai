package com.aura.auth.controller;

import com.aura.auth.dto.AuthResponse;
import com.aura.auth.dto.LoginRequest;
import com.aura.auth.dto.OtpRequest;
import com.aura.auth.dto.PasswordResetRequest;
import com.aura.auth.dto.RegisterRequest;
import com.aura.auth.service.AuthService;
import com.aura.auth.service.TwoFactorService;
import com.aura.common.response.ApiResponse;
import com.aura.user.dto.UserDto;
import com.aura.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final TwoFactorService twoFactorService;

    public AuthController(AuthService authService, TwoFactorService twoFactorService) {
        this.authService = authService;
        this.twoFactorService = twoFactorService;
    }

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("User registered successfully", authService.register(request));
    }

    @Operation(summary = "Login")
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        return ApiResponse.success("Login successful", authService.login(request, ip, userAgent));
    }

    @Operation(summary = "Refresh token")
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(@RequestParam String refreshToken, HttpServletRequest request) {
        return ApiResponse.success("Token refreshed", authService.refreshToken(refreshToken, request.getRemoteAddr()));
    }

    @Operation(summary = "Logout")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestParam(required = false) String refreshToken,
                                    @RequestParam(required = false) String sessionId) {
        authService.logout(refreshToken, sessionId);
        return ApiResponse.success("Logout successful", null);
    }

    @Operation(summary = "Forgot password")
    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ApiResponse.success("Password reset OTP sent", null);
    }

    @Operation(summary = "Reset password")
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successfully", null);
    }

    @Operation(summary = "Verify email")
    @PostMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String email, @RequestParam String otp) {
        authService.verifyEmail(email, otp);
        return ApiResponse.success("Email verified successfully", null);
    }

    @Operation(summary = "Get current user")
    @GetMapping("/me")
    public ApiResponse<UserDto> getCurrentUser(@AuthenticationPrincipal User user) {
        return ApiResponse.success("Current user fetched", UserDto.fromUser(user));
    }

    @Operation(summary = "Setup 2FA")
    @PostMapping("/2fa/setup")
    public ApiResponse<TwoFactorService.TwoFactorSetupResponse> setup2fa(@AuthenticationPrincipal User user) {
        return ApiResponse.success("2FA setup initiated", twoFactorService.setupTwoFactor(user.getId()));
    }

    @Operation(summary = "Verify and enable 2FA")
    @PostMapping("/2fa/verify")
    public ApiResponse<Void> verify2fa(@AuthenticationPrincipal User user, @RequestParam String code) {
        twoFactorService.verifyAndEnable(user.getId(), code);
        return ApiResponse.success("2FA enabled successfully", null);
    }

    @Operation(summary = "Disable 2FA")
    @DeleteMapping("/2fa")
    public ApiResponse<Void> disable2fa(@AuthenticationPrincipal User user, @RequestParam String code) {
        twoFactorService.disable(user.getId(), code);
        return ApiResponse.success("2FA disabled successfully", null);
    }
}
