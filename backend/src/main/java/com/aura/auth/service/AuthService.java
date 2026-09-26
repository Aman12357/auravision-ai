package com.aura.auth.service;

import com.aura.auth.dto.AuthResponse;
import com.aura.auth.dto.LoginRequest;
import com.aura.auth.dto.OtpRequest;
import com.aura.auth.dto.PasswordResetRequest;
import com.aura.auth.dto.RegisterRequest;
import com.aura.auth.entity.OtpPurpose;
import com.aura.auth.entity.RefreshToken;
import com.aura.auth.repository.RefreshTokenRepository;
import com.aura.common.exception.AuraException;
import com.aura.common.exception.ErrorCode;
import com.aura.user.dto.UserDto;
import com.aura.user.entity.Role;
import com.aura.user.entity.RoleName;
import com.aura.user.entity.User;
import com.aura.user.repository.RoleRepository;
import com.aura.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;
    private final SessionService sessionService;
    private final TwoFactorService twoFactorService;

    @Value("${app.security.jwt.expiration-ms:900000}")
    private long jwtExpirationMs;
    
    @Value("${app.security.jwt.refresh-expiration-ms:2592000000}") // 30 days
    private long jwtRefreshExpirationMs;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       RefreshTokenRepository refreshTokenRepository, OtpService otpService,
                       SessionService sessionService, TwoFactorService twoFactorService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpService = otpService;
        this.sessionService = sessionService;
        this.twoFactorService = twoFactorService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AuraException(ErrorCode.BAD_REQUEST, "Email already in use");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new AuraException(ErrorCode.BAD_REQUEST, "Username already in use");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        
        Role userRole = roleRepository.findByName(RoleName.USER)
            .orElseThrow(() -> new AuraException(ErrorCode.INTERNAL_SERVER_ERROR, "Default role not found"));
        user.getRoles().add(userRole);

        user = userRepository.save(user);
        
        otpService.generateAndSendOtp(user.getEmail(), OtpPurpose.EMAIL_VERIFICATION);
        
        return createAuthResponse(user, false, null, null, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ip, String userAgent) {
        User user = userRepository.findByEmailOrUsername(request.emailOrUsername(), request.emailOrUsername())
                .orElseThrow(() -> new AuraException(ErrorCode.INVALID_CREDENTIALS, "Invalid credentials"));

        if (user.isAccountLocked()) {
            throw new AuraException(ErrorCode.UNAUTHORIZED, "Account is locked");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            incrementLoginAttempts(user);
            throw new AuraException(ErrorCode.INVALID_CREDENTIALS, "Invalid credentials");
        }

        user.setLoginAttempts(0);
        
        if (user.isTwoFactorEnabled()) {
            String tempToken = jwtService.generateTempToken(user, 300000); // 5 mins
            return new AuthResponse(null, null, "Bearer", 0, UserDto.fromUser(user), true, tempToken);
        }

        return createAuthResponse(user, false, null, ip, userAgent);
    }

    @Transactional
    public AuthResponse refreshToken(String token, String ip) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuraException(ErrorCode.UNAUTHORIZED, "Refresh token is not in database"));

        if (!refreshToken.isValid()) {
            throw new AuraException(ErrorCode.UNAUTHORIZED, "Refresh token was expired or revoked");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new AuraException(ErrorCode.USER_NOT_FOUND, "User not found"));

        // Rotate
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        
        return createAuthResponse(user, false, null, ip, refreshToken.getDeviceInfo());
    }

    @Transactional
    public void logout(String refreshToken, String sessionId) {
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
        if (sessionId != null) {
            sessionService.invalidateSession(sessionId);
        }
    }

    private void incrementLoginAttempts(User user) {
        user.setLoginAttempts(user.getLoginAttempts() + 1);
        if (user.getLoginAttempts() >= 5) {
            user.setAccountLocked(true);
        }
        userRepository.save(user);
    }

    private AuthResponse createAuthResponse(User user, boolean requiresTwoFactor, String twoFactorToken, String ip, String userAgent) {
        String accessToken = jwtService.generateAccessToken(user);
        
        RefreshToken rt = new RefreshToken();
        rt.setToken(jwtService.generateRefreshToken());
        rt.setUserId(user.getId());
        rt.setExpiresAt(ZonedDateTime.now().plusSeconds(jwtRefreshExpirationMs / 1000));
        rt.setIpAddress(ip);
        rt.setDeviceInfo(userAgent);
        refreshTokenRepository.save(rt);
        
        if (ip != null) {
            user.setLastLoginIp(ip);
            user.setLastLoginAt(ZonedDateTime.now());
            userRepository.save(user);
            sessionService.createSession(user.getId(), userAgent, ip);
        }
        
        return new AuthResponse(accessToken, rt.getToken(), "Bearer", jwtExpirationMs / 1000, UserDto.fromUser(user), requiresTwoFactor, twoFactorToken);
    }

    @Transactional
    public void verifyEmail(String email, String otp) {
        if (otpService.verifyOtp(email, otp, OtpPurpose.EMAIL_VERIFICATION)) {
            User user = userRepository.findByEmail(email).orElseThrow();
            user.setEmailVerified(true);
            userRepository.save(user);
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            otpService.generateAndSendOtp(email, OtpPurpose.PASSWORD_RESET);
        });
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        // Validation logic using token/otp...
    }
}
