package com.aura.notification.service;

import com.aura.notification.dto.NotificationDto;
import com.aura.notification.entity.Notification;
import com.aura.notification.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<UUID, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    public NotificationDto createNotification(UUID userId, String type, String title, String body, Map<String, Object> data) {
        String dataJson = null;
        try {
            if (data != null) {
                dataJson = objectMapper.writeValueAsString(data);
            }
        } catch (Exception e) {
            // ignore
        }
        
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .data(dataJson)
                .build();
        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = NotificationDto.fromNotification(saved);
        
        broadcast(userId, dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable).map(NotificationDto::fromNotification);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        if (notification.getUserId().equals(userId)) {
            notification.setRead(true);
            notification.setReadAt(ZonedDateTime.now());
            notificationRepository.save(notification);
        }
    }

    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    public SseEmitter subscribe(UUID userId) {
        SseEmitter emitter = new SseEmitter(3600000L); // 1 hour timeout
        userEmitters.put(userId, emitter);
        
        emitter.onCompletion(() -> userEmitters.remove(userId, emitter));
        emitter.onTimeout(() -> userEmitters.remove(userId, emitter));
        emitter.onError((e) -> userEmitters.remove(userId, emitter));
        
        return emitter;
    }

    private void broadcast(UUID userId, NotificationDto notification) {
        SseEmitter emitter = userEmitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (Exception e) {
                userEmitters.remove(userId, emitter);
            }
        }
    }
}
