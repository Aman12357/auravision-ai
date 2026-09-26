package com.aura.admin.service;

import com.aura.admin.dto.AdminDashboardDto;
import com.aura.admin.dto.AuditLogDto;
import com.aura.admin.dto.ProviderHealthDto;
import com.aura.admin.dto.SystemMetricsDto;
import com.aura.user.entity.User;
import com.aura.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminService {

    private final UserRepository userRepository;

    public AdminDashboardDto getDashboardStats() {
        return new AdminDashboardDto(
                userRepository.count(),
                15, // Stub values for demo
                150,
                300,
                5000,
                120,
                25000,
                150000,
                Map.of("OpenAI", 2000L, "Runway", 1500L, "Luma", 1500L),
                Map.of("OpenAI", 99.5, "Runway", 98.2, "Luma", 97.5),
                getProviderHealth()
        );
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserDetails(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void lockUser(UUID userId) {
        User user = getUserDetails(userId);
        user.setActive(false);
        userRepository.save(user);
        log.info("Locked user {}", userId);
    }

    public void unlockUser(UUID userId) {
        User user = getUserDetails(userId);
        user.setActive(true);
        userRepository.save(user);
        log.info("Unlocked user {}", userId);
    }

    public List<ProviderHealthDto> getProviderHealth() {
        return List.of(
                new ProviderHealthDto("OpenAI", "Sora (OpenAI)", true, true, "HEALTHY", 99.5, 45.0, ZonedDateTime.now()),
                new ProviderHealthDto("Runway", "Runway Gen-2", true, true, "HEALTHY", 98.2, 55.0, ZonedDateTime.now()),
                new ProviderHealthDto("Luma", "Luma Dream Machine", true, true, "HEALTHY", 97.5, 60.0, ZonedDateTime.now())
        );
    }

    public void toggleProvider(String providerName, boolean enabled) {
        log.info("Toggled provider {} to {}", providerName, enabled);
        // Stub: update DB
    }

    public Page<AuditLogDto> getAuditLogs(Pageable pageable, String userId, String action) {
        return new PageImpl<>(Collections.emptyList(), pageable, 0); // Stub
    }

    public SystemMetricsDto getSystemMetrics() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        
        long usedMem = memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long maxMem = memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024);
        int threads = threadBean.getThreadCount();
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        
        return new SystemMetricsDto(usedMem, maxMem, threads, uptime, 5, 2);
    }
}
