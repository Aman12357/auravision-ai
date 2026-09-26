package com.aura.auth.service;

import com.aura.auth.entity.OtpCode;
import com.aura.auth.entity.OtpPurpose;
import com.aura.auth.repository.OtpCodeRepository;
import com.aura.common.exception.AuraException;
import com.aura.common.exception.ErrorCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.ZonedDateTime;

@Service
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();
    // private final EmailService emailService; // Assuming an email service exists

    public OtpService(OtpCodeRepository otpCodeRepository, PasswordEncoder passwordEncoder) {
        this.otpCodeRepository = otpCodeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        ZonedDateTime tenMinutesAgo = ZonedDateTime.now().minusMinutes(10);
        int recentCount = otpCodeRepository.countByEmailAndCreatedAtAfter(email, tenMinutesAgo);
        
        if (recentCount >= 5) {
            throw new AuraException(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many OTP requests. Please try again later.");
        }

        otpCodeRepository.deleteByEmailAndPurpose(email, purpose);

        String code = String.format("%06d", secureRandom.nextInt(1000000));
        
        OtpCode otpCode = new OtpCode();
        otpCode.setEmail(email);
        otpCode.setPurpose(purpose);
        otpCode.setCode(passwordEncoder.encode(code));
        otpCode.setExpiresAt(ZonedDateTime.now().plusMinutes(15));
        
        otpCodeRepository.save(otpCode);

        // emailService.sendOtpEmail(email, code, purpose);
        System.out.println("Generated OTP for " + email + ": " + code); // For dev
    }

    @Transactional
    public boolean verifyOtp(String email, String code, OtpPurpose purpose) {
        OtpCode otpCode = otpCodeRepository.findByEmailAndPurposeAndUsedFalse(email, purpose)
                .orElseThrow(() -> new AuraException(ErrorCode.INVALID_OTP, "Invalid or expired OTP"));

        if (otpCode.isExpired()) {
            throw new AuraException(ErrorCode.INVALID_OTP, "OTP has expired");
        }

        if (otpCode.isMaxAttemptsReached()) {
            throw new AuraException(ErrorCode.RATE_LIMIT_EXCEEDED, "Maximum OTP verification attempts reached");
        }

        otpCode.setAttempts(otpCode.getAttempts() + 1);

        if (!passwordEncoder.matches(code, otpCode.getCode())) {
            otpCodeRepository.save(otpCode);
            return false;
        }

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);
        return true;
    }
}
