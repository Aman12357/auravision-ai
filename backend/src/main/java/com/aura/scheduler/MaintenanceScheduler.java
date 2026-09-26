package com.aura.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class MaintenanceScheduler {

    // These services would be injected here
    // private final SubscriptionService subscriptionService;
    // private final TokenService tokenService;
    // private final WorkspaceService workspaceService;
    // private final VideoJobService videoJobService;
    // private final AnalyticsService analyticsService;

    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void grantMonthlyCredits() {
        log.info("Running job: grantMonthlyCredits");
        // Find all ACTIVE subscriptions where current_period_start = today
        // For each: call CreditService.creditCredits(plan.creditsMonthly, "SUBSCRIPTION_GRANT")
    }

    @Scheduled(cron = "0 2 * * * *") // Every day 2am
    public void cleanupExpiredTokens() {
        log.info("Running job: cleanupExpiredTokens");
        // Delete refresh_tokens where expires_at < NOW()
        // Delete otp_codes where expires_at < NOW() - 1 hour
        // Delete team_invitations where status=PENDING and expires_at < NOW() (mark EXPIRED)
    }

    @Scheduled(cron = "0 3 * * * *") // Every day 3am
    public void recalculateStorageUsage() {
        log.info("Running job: recalculateStorageUsage");
        // For each workspace: SUM(file_size_bytes) from video_assets
        // UPDATE workspaces SET storage_used_bytes = calculated
        // Warn if >90% of limit
    }

    @Scheduled(cron = "0 */30 * * * *") // Every 30 minutes
    public void retryFailedJobs() {
        log.info("Running job: retryFailedJobs");
        // Find VideoJobs with status=FAILED, retryCount < maxRetries, updatedAt < 5min ago
        // Republish to Kafka VIDEO_GENERATION_REQUESTED topic
        // Increment retryCount
    }

    @Scheduled(cron = "0 0 0 * * *") // Midnight
    public void generateDailyAnalyticsSummary() {
        log.info("Running job: generateDailyAnalyticsSummary");
        // Count videos generated yesterday per workspace
        // Count credits used yesterday
        // Log platform totals
    }
}
