package com.aura.user.service;

import com.aura.common.exception.AuraException;
import com.aura.common.exception.ErrorCode;
import com.aura.user.dto.UpdateProfileRequest;
import com.aura.user.dto.UserDto;
import com.aura.user.entity.User;
import com.aura.user.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Cacheable(value = "users", key = "#id")
    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        return UserDto.fromUser(getUserEntityById(id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AuraException(ErrorCode.USER_NOT_FOUND, "User not found"));
    }

    @Transactional(readOnly = true)
    public User getUserEntityById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AuraException(ErrorCode.USER_NOT_FOUND, "User not found"));
    }

    @CacheEvict(value = "users", key = "#userId")
    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = getUserEntityById(userId);
        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.phoneNumber() != null) user.setPhoneNumber(request.phoneNumber());
        return UserDto.fromUser(userRepository.save(user));
    }

    @CacheEvict(value = "users", key = "#userId")
    @Transactional
    public void lockAccount(UUID userId) {
        User user = getUserEntityById(userId);
        user.setAccountLocked(true);
        userRepository.save(user);
    }

    @CacheEvict(value = "users", key = "#userId")
    @Transactional
    public void unlockAccount(UUID userId) {
        User user = getUserEntityById(userId);
        user.setAccountLocked(false);
        user.setLoginAttempts(0);
        userRepository.save(user);
    }

    @Transactional
    public void incrementLoginAttempts(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLoginAttempts(user.getLoginAttempts() + 1);
            if (user.getLoginAttempts() >= 5) {
                user.setAccountLocked(true);
            }
            userRepository.save(user);
        });
    }

    @Transactional
    public void resetLoginAttempts(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLoginAttempts(0);
            userRepository.save(user);
        });
    }

    @Transactional
    public void updateLastLogin(UUID userId, String ip) {
        User user = getUserEntityById(userId);
        user.setLastLoginAt(ZonedDateTime.now());
        user.setLastLoginIp(ip);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        User user = getUserEntityById(userId);
        if (user.getPasswordHash() != null && !passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new AuraException(ErrorCode.INVALID_CREDENTIALS, "Old password does not match");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @CacheEvict(value = "users", key = "#userId")
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = getUserEntityById(userId);
        user.setDeleted(true);
        user.setDeletedAt(ZonedDateTime.now());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getUserPage(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDto::fromUser);
    }
}
