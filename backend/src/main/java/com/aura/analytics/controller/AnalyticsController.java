package com.aura.analytics.controller;

import com.aura.analytics.dto.WorkspaceAnalyticsDto;
import com.aura.analytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics", description = "Workspace analytics and metrics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/workspace")
    @Operation(summary = "Get workspace analytics dashboard data")
    public ResponseEntity<WorkspaceAnalyticsDto> getWorkspaceAnalytics(
            @RequestParam UUID workspaceId,
            @RequestParam(defaultValue = "30") int days) {
        
        return ResponseEntity.ok(analyticsService.getWorkspaceAnalytics(workspaceId, days));
    }
}
