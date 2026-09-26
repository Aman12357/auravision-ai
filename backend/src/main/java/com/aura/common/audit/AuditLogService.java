package com.aura.common.audit;

import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private final AuditLogRepository auditLogRepository;

    @Async("defaultExecutor")
    @Transactional
    public void logSuccess(UUID userId, String action, String resourceType, String resourceId, String ipAddress, String userAgent) {
        logEvent(userId, action, resourceType, resourceId, ipAddress, userAgent, "SUCCESS", null);
    }

    @Async("defaultExecutor")
    @Transactional
    public void logFailure(UUID userId, String action, String resourceType, String resourceId, String ipAddress, String userAgent, String details) {
        logEvent(userId, action, resourceType, resourceId, ipAddress, userAgent, "FAILURE", details);
    }

    private void logEvent(UUID userId, String action, String resourceType, String resourceId, String ipAddress, String userAgent, String outcome, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .outcome(outcome)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }
}
