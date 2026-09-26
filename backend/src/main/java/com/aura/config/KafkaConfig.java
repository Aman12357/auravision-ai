package com.aura.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.partitions:3}")
    private int partitions;

    @Value("${spring.kafka.replicas:1}")
    private int replicas;

    @Bean
    public NewTopic videoGenerationRequestedTopic() {
        return TopicBuilder.name("VIDEO_GENERATION_REQUESTED")
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic videoGenerationCompletedTopic() {
        return TopicBuilder.name("VIDEO_GENERATION_COMPLETED")
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic videoGenerationFailedTopic() {
        return TopicBuilder.name("VIDEO_GENERATION_FAILED")
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic notificationSendTopic() {
        return TopicBuilder.name("NOTIFICATION_SEND")
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic auditLogCreateTopic() {
        return TopicBuilder.name("AUDIT_LOG_CREATE")
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    @Bean
    public NewTopic analyticsEventTopic() {
        return TopicBuilder.name("ANALYTICS_EVENT")
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }
}
