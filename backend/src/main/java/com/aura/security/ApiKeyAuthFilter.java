package com.aura.security;

import com.aura.workspace.entity.ApiKey;
import com.aura.workspace.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String headerApiKey = request.getHeader("X-API-Key");
        String apiKey = null;

        if (authHeader != null && authHeader.startsWith("Bearer aura_sk_")) {
            apiKey = authHeader.substring(7);
        } else if (headerApiKey != null && headerApiKey.startsWith("aura_sk_")) {
            apiKey = headerApiKey;
        }

        if (apiKey != null) {
            String hash = hashApiKey(apiKey);
            Optional<ApiKey> keyOpt = apiKeyRepository.findByKeyHash(hash);

            if (keyOpt.isPresent()) {
                ApiKey keyEntity = keyOpt.get();
                if (keyEntity.isActive() && (keyEntity.getExpiresAt() == null || keyEntity.getExpiresAt().isAfter(ZonedDateTime.now()))) {
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(keyEntity.getUser().getEmail());

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(auth);

                    // Update last used at asynchronously in real app, keeping simple here
                    keyEntity.setLastUsedAt(ZonedDateTime.now());
                    apiKeyRepository.save(keyEntity);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String hashApiKey(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
