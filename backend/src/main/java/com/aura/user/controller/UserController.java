package com.aura.user.controller;

import com.aura.common.response.ApiResponse;
import com.aura.user.dto.UserDto;
import com.aura.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<UserDto>> getUsers(Pageable pageable) {
        return ApiResponse.success("Users fetched successfully", userService.getUserPage(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isSelf(#id)")
    public ApiResponse<UserDto> getUser(@PathVariable UUID id) {
        return ApiResponse.success("User fetched successfully", userService.getUserById(id));
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> lockUser(@PathVariable UUID id) {
        userService.lockAccount(id);
        return ApiResponse.success("User locked successfully", null);
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> unlockUser(@PathVariable UUID id) {
        userService.unlockAccount(id);
        return ApiResponse.success("User unlocked successfully", null);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isSelf(#id)")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteAccount(id);
        return ApiResponse.success("User deleted successfully", null);
    }
}
