package com.aura.notification.controller;

import com.aura.common.response.ApiResponse;
import com.aura.notification.dto.NotificationDto;
import com.aura.notification.service.NotificationService;
import com.aura.user.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name="Notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<NotificationDto>> getNotifications(@AuthenticationPrincipal User user, Pageable pageable) {
        return ApiResponse.success(notificationService.getNotifications(user.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(@AuthenticationPrincipal User user) {
        return ApiResponse.success(notificationService.getUnreadCount(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user.getId());
        return ApiResponse.success(null);
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ApiResponse.success(null);
    }

    @GetMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal User user) {
        return notificationService.subscribe(user.getId());
    }
}
