package com.aura.auth.service;

import com.aura.auth.entity.TwoFactorConfig;
import com.aura.auth.repository.TwoFactorConfigRepository;
import com.aura.common.exception.AuraException;
import com.aura.common.exception.ErrorCode;
import com.aura.user.entity.User;
import com.aura.user.repository.UserRepository;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.util.Utils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TwoFactorService {

    private final TwoFactorConfigRepository twoFactorConfigRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Using simple mock encryption for the secret, in production use real AES
    private final String SECRET_KEY = "my-secret-key"; 

    public TwoFactorService(TwoFactorConfigRepository twoFactorConfigRepository, 
                            UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.twoFactorConfigRepository = twoFactorConfigRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record TwoFactorSetupResponse(String secret, String qrCodeUri, List<String> backupCodes) {}

    @Transactional
    public TwoFactorSetupResponse setupTwoFactor(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AuraException(ErrorCode.USER_NOT_FOUND, "User not found"));
            
        if (twoFactorConfigRepository.existsByUserIdAndEnabledTrue(userId)) {
            throw new AuraException(ErrorCode.BAD_REQUEST, "2FA is already enabled");
        }
        
        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        String secret = secretGenerator.generate();
        
        List<String> plainBackupCodes = generateBackupCodes();
        String hashedBackupCodes = encryptBackupCodes(plainBackupCodes);
        
        TwoFactorConfig config = twoFactorConfigRepository.findByUserId(userId).orElse(new TwoFactorConfig());
        config.setUserId(userId);
        config.setSecret(encryptSecret(secret));
        config.setBackupCodes(hashedBackupCodes);
        config.setEnabled(false);
        twoFactorConfigRepository.save(config);
        
        QrData data = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("Aura Video AI")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
                
        QrGenerator generator = new ZxingPngQrGenerator();
        byte[] imageData;
        try {
            imageData = generator.generate(data);
        } catch (QrGenerationException e) {
            throw new AuraException(ErrorCode.INTERNAL_SERVER_ERROR, "Error generating QR code");
        }
        
        String mimeType = generator.getImageMimeType();
        String dataUri = Utils.getDataUriForImage(imageData, mimeType);
        
        return new TwoFactorSetupResponse(secret, dataUri, plainBackupCodes);
    }

    @Transactional
    public void verifyAndEnable(UUID userId, String totpCode) {
        TwoFactorConfig config = twoFactorConfigRepository.findByUserId(userId)
                .orElseThrow(() -> new AuraException(ErrorCode.NOT_FOUND, "2FA config not found"));
                
        if (config.isEnabled()) {
            throw new AuraException(ErrorCode.BAD_REQUEST, "2FA is already enabled");
        }
        
        String plainSecret = decryptSecret(config.getSecret());
        CodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        
        if (!verifier.isValidCode(plainSecret, totpCode)) {
            throw new AuraException(ErrorCode.INVALID_OTP, "Invalid 2FA code");
        }
        
        config.setEnabled(true);
        config.setVerifiedAt(ZonedDateTime.now());
        twoFactorConfigRepository.save(config);
        
        User user = userRepository.findById(userId).orElseThrow();
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean verifyTotpCode(UUID userId, String code) {
        TwoFactorConfig config = twoFactorConfigRepository.findByUserId(userId)
                .orElseThrow(() -> new AuraException(ErrorCode.NOT_FOUND, "2FA config not found"));
                
        if (!config.isEnabled()) {
            return false;
        }
        
        String plainSecret = decryptSecret(config.getSecret());
        CodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
        
        if (verifier.isValidCode(plainSecret, code)) {
            return true;
        }
        
        // Backup code verification logic would go here.
        return false;
    }

    @Transactional
    public void disable(UUID userId, String totpCode) {
        if (!verifyTotpCode(userId, totpCode)) {
             throw new AuraException(ErrorCode.INVALID_OTP, "Invalid 2FA code");
        }
        
        User user = userRepository.findById(userId).orElseThrow();
        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        
        twoFactorConfigRepository.findByUserId(userId).ifPresent(twoFactorConfigRepository::delete);
    }

    private List<String> generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            codes.add(String.format("%08d", random.nextInt(100000000)));
        }
        return codes;
    }
    
    // Placeholder encryption methods
    private String encryptSecret(String plainSecret) { return plainSecret; } // Replace with AES
    private String decryptSecret(String encryptedSecret) { return encryptedSecret; } // Replace with AES
    private String encryptBackupCodes(List<String> codes) { return codes.toString(); }
}
