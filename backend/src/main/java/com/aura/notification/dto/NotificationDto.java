package com.aura.notification.dto;

import com.aura.notification.entity.Notification;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

public record NotificationDto(
    UUID id, String type, String title, String body,
    Map<String, Object> data, Boolean read, ZonedDateTime readAt, ZonedDateTime createdAt
) {
    public static NotificationDto fromNotification(Notification n) {
        Map<String, Object> dataMap = null;
        if (n.getData() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                dataMap = mapper.readValue(n.getData(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                // ignore
            }
        }
        
        return new NotificationDto(
            n.getId(), n.getType(), n.getTitle(), n.getBody(),
            dataMap, n.getRead(), n.getReadAt(), n.getCreatedAt()
        );
    }
}
