package com.aura.common.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public enum OtpPurpose { VERIFY_EMAIL, RESET_PASSWORD, LOGIN }

    @Async
    public void sendOtpEmail(String to, String otp, OtpPurpose purpose) {
        String subject = switch (purpose) {
            case VERIFY_EMAIL -> "Verify your email";
            case RESET_PASSWORD -> "Password Reset OTP";
            case LOGIN -> "Login OTP";
        };

        String content = "<h2>" + subject + "</h2>" +
                "<p>Your OTP code is:</p>" +
                "<div style='font-size:24px; font-weight:bold; padding:10px; border:1px solid #ddd; display:inline-block;'>" + otp + "</div>" +
                "<p>This code will expire shortly.</p>";

        sendHtmlEmail(to, subject, buildHtmlEmail(content));
    }

    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        String subject = "Welcome to Aura Video AI!";
        String content = "<h2>Hello " + fullName + "!</h2>" +
                "<p>Welcome to Aura Video AI. Get started with AI-powered video generation.</p>" +
                "<a href='" + frontendUrl + "/dashboard' style='background:#007BFF; color:#fff; padding:10px 20px; text-decoration:none;'>Start Generating</a>";
        sendHtmlEmail(to, subject, buildHtmlEmail(content));
    }

    @Async
    public void sendVideoCompleteEmail(String to, String userName, String videoTitle, String videoUrl) {
        String subject = "Your video is ready: " + videoTitle;
        String content = "<h2>Hi " + userName + ",</h2>" +
                "<p>Your video <b>" + videoTitle + "</b> has finished processing.</p>" +
                "<a href='" + videoUrl + "' style='background:#28A745; color:#fff; padding:10px 20px; text-decoration:none;'>Download Video</a>";
        sendHtmlEmail(to, subject, buildHtmlEmail(content));
    }

    @Async
    public void sendTeamInviteEmail(String to, String inviterName, String workspaceName, String acceptUrl) {
        String subject = "You've been invited to join " + workspaceName;
        String content = "<h2>Workspace Invitation</h2>" +
                "<p>" + inviterName + " has invited you to join the workspace <b>" + workspaceName + "</b>.</p>" +
                "<a href='" + acceptUrl + "' style='background:#007BFF; color:#fff; padding:10px 20px; text-decoration:none;'>Accept Invitation</a>";
        sendHtmlEmail(to, subject, buildHtmlEmail(content));
    }

    @Async
    public void sendPaymentFailedEmail(String to, String planName, String updateUrl) {
        String subject = "Payment Failed for " + planName;
        String content = "<h2>Payment Action Required</h2>" +
                "<p>We couldn't process your recent payment for your " + planName + " subscription.</p>" +
                "<a href='" + updateUrl + "' style='background:#DC3545; color:#fff; padding:10px 20px; text-decoration:none;'>Update Payment Method</a>";
        sendHtmlEmail(to, subject, buildHtmlEmail(content));
    }

    @Async
    public void sendPasswordChangedEmail(String to, String userName) {
        String subject = "Security Alert: Password Changed";
        String content = "<h2>Hi " + userName + ",</h2>" +
                "<p>Your password was recently changed. If you didn't do this, please contact support immediately.</p>";
        sendHtmlEmail(to, subject, buildHtmlEmail(content));
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    private String buildHtmlEmail(String templateContent) {
        return "<html><body style='font-family:Arial,sans-serif; color:#333; max-width:600px; margin:0 auto;'>" +
                "<div style='text-align:center; padding:20px; background:#f4f4f4;'>" +
                "<h1>Aura Video AI</h1>" +
                "</div>" +
                "<div style='padding:20px;'>" + templateContent + "</div>" +
                "<div style='text-align:center; font-size:12px; color:#888; padding:20px; border-top:1px solid #eee;'>" +
                "&copy; " + java.time.Year.now().getValue() + " Aura Video AI. All rights reserved." +
                "</div>" +
                "</body></html>";
    }
}
