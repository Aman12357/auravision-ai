package com.aura.auth.oauth2;

import com.aura.auth.entity.RefreshToken;
import com.aura.auth.repository.RefreshTokenRepository;
import com.aura.auth.service.JwtService;
import com.aura.auth.service.SessionService;
import com.aura.user.entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.ZonedDateTime;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final SessionService sessionService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Value("${app.security.jwt.refresh-expiration-ms:2592000000}")
    private long jwtRefreshExpirationMs;

    public OAuth2SuccessHandler(JwtService jwtService, RefreshTokenRepository refreshTokenRepository, SessionService sessionService) {
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.sessionService = sessionService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2UserService.AuraOAuth2User oauth2User = (OAuth2UserService.AuraOAuth2User) authentication.getPrincipal();
        User user = oauth2User.getUser();

        String accessToken = jwtService.generateAccessToken(user);
        
        RefreshToken rt = new RefreshToken();
        rt.setToken(jwtService.generateRefreshToken());
        rt.setUserId(user.getId());
        rt.setExpiresAt(ZonedDateTime.now().plusSeconds(jwtRefreshExpirationMs / 1000));
        rt.setIpAddress(request.getRemoteAddr());
        rt.setDeviceInfo(request.getHeader("User-Agent"));
        refreshTokenRepository.save(rt);

        sessionService.createSession(user.getId(), request.getHeader("User-Agent"), request.getRemoteAddr());

        // Use a short-lived state token or temporary cache in production to securely pass tokens.
        // For simplicity as requested, appending to URL.
        String targetUrl = frontendUrl + "/auth/oauth2/callback?token=" + accessToken + "&refresh=" + rt.getToken();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
