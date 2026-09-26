package com.aura.user.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.dto.UpdateProfileRequest;
import com.aura.user.dto.UserDto;
import com.aura.user.entity.User;
import com.aura.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<UserDto> getProfile(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success("Profile fetched successfully", userService.getUserById(currentUser.getId()));
    }

    @PutMapping
    public ApiResponse<UserDto> updateProfile(@AuthenticationPrincipal User currentUser,
                                              @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success("Profile updated successfully", userService.updateProfile(currentUser.getId(), request));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal User currentUser,
                                            @RequestParam String oldPassword,
                                            @RequestParam String newPassword) {
        userService.changePassword(currentUser.getId(), oldPassword, newPassword);
        return ApiResponse.success("Password changed successfully", null);
    }

    @PostMapping("/avatar")
    public ApiResponse<UserDto> uploadAvatar(@AuthenticationPrincipal User currentUser,
                                             @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("Avatar uploaded successfully", userService.getUserById(currentUser.getId()));
    }
}
