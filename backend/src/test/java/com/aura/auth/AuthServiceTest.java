package com.aura.auth;

import com.aura.auth.dto.AuthResponse;
import com.aura.auth.dto.LoginRequest;
import com.aura.auth.dto.RegisterRequest;
import com.aura.auth.entity.RefreshToken;
import com.aura.auth.repository.OtpCodeRepository;
import com.aura.auth.repository.RefreshTokenRepository;
import com.aura.auth.service.AuthService;
import com.aura.auth.service.JwtService;
import com.aura.auth.service.OtpService;
import com.aura.auth.service.SessionService;
import com.aura.common.audit.AuditLogService;
import com.aura.common.exception.AuraException;
import com.aura.common.exception.ErrorCode;
import com.aura.user.entity.AuthProvider;
import com.aura.user.entity.Role;
import com.aura.user.entity.RoleName;
import com.aura.user.entity.User;
import com.aura.user.repository.RoleRepository;
import com.aura.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private OtpCodeRepository otpCodeRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private OtpService otpService;
    @Mock private SessionService sessionService;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        userRole = new Role();
        userRole.setName(RoleName.USER);

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@aura.ai");
        testUser.setUsername("testuser");
        testUser.setPasswordHash("$2a$12$hashedpassword");
        testUser.setFullName("Test User");
        testUser.setEmailVerified(true);
        testUser.setAccountLocked(false);
        testUser.setTwoFactorEnabled(false);
        testUser.setAuthProvider(AuthProvider.LOCAL);
        testUser.setRoles(Set.of(userRole));
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("new@aura.ai", "newuser", "SecurePass123!", "New User");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");
        when(roleRepository.findByName(RoleName.USER)).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token_jwt");
        when(jwtService.generateRefreshToken()).thenReturn("refresh_token_uuid");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token_jwt", response.accessToken());
        assertEquals("refresh_token_uuid", response.refreshToken());
        assertFalse(response.requiresTwoFactor());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("test@aura.ai", "newuser", "SecurePass123!", "New User");

        when(userRepository.existsByEmail("test@aura.ai")).thenReturn(true);

        AuraException exception = assertThrows(AuraException.class, () -> authService.register(request));
        assertEquals(ErrorCode.USER_002, exception.getErrorCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("test@aura.ai", "SecurePass123!", false, "Desktop App");

        when(userRepository.findByEmailOrUsername("test@aura.ai", "test@aura.ai")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("SecurePass123!", testUser.getPasswordHash())).thenReturn(true);
        when(jwtService.generateAccessToken(testUser)).thenReturn("access_token_jwt");
        when(jwtService.generateRefreshToken()).thenReturn("refresh_token_uuid");

        AuthResponse response = authService.login(request, "127.0.0.1", "JUnit-Test");

        assertNotNull(response);
        assertEquals("access_token_jwt", response.accessToken());
        verify(sessionService, times(1)).createSession(eq(testUser.getId()), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception on login with incorrect password")
    void testLoginInvalidPassword() {
        LoginRequest request = new LoginRequest("test@aura.ai", "WrongPass!", false, "Desktop App");

        when(userRepository.findByEmailOrUsername("test@aura.ai", "test@aura.ai")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPass!", testUser.getPasswordHash())).thenReturn(false);

        AuraException exception = assertThrows(AuraException.class, () -> authService.login(request, "127.0.0.1", "JUnit-Test"));
        assertEquals(ErrorCode.AUTH_001, exception.getErrorCode());
    }
}
