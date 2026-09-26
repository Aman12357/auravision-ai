package com.aura.admin.controller;

import com.aura.admin.dto.AdminDashboardDto;
import com.aura.admin.dto.AuditLogDto;
import com.aura.admin.dto.ProviderHealthDto;
import com.aura.admin.dto.SystemMetricsDto;
import com.aura.admin.service.AdminService;
import com.aura.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Get admin dashboard stats")
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @Operation(summary = "Get all users")
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @Operation(summary = "Get user details")
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserDetails(id));
    }

    @Operation(summary = "Lock user account")
    @PutMapping("/users/{id}/lock")
    public ResponseEntity<Void> lockUser(@PathVariable UUID id) {
        adminService.lockUser(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Unlock user account")
    @PutMapping("/users/{id}/unlock")
    public ResponseEntity<Void> unlockUser(@PathVariable UUID id) {
        adminService.unlockUser(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get provider health stats")
    @GetMapping("/providers")
    public ResponseEntity<List<ProviderHealthDto>> getProviderHealth() {
        return ResponseEntity.ok(adminService.getProviderHealth());
    }

    @Operation(summary = "Toggle provider enabled state")
    @PutMapping("/providers/{name}/toggle")
    public ResponseEntity<Void> toggleProvider(@PathVariable String name, @RequestParam boolean enabled) {
        adminService.toggleProvider(name, enabled);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get audit logs")
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            Pageable pageable,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action) {
        return ResponseEntity.ok(adminService.getAuditLogs(pageable, userId, action));
    }

    @Operation(summary = "Get system metrics")
    @GetMapping("/metrics")
    public ResponseEntity<SystemMetricsDto> getSystemMetrics() {
        return ResponseEntity.ok(adminService.getSystemMetrics());
    }
}
