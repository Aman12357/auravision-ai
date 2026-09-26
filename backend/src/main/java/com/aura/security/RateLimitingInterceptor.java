package com.aura.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("${rate-limit.auth.login:10}")
    private int loginLimit;

    @Value("${rate-limit.auth.register:5}")
    private int registerLimit;

    @Value("${rate-limit.api.jobs:30}")
    private int jobsLimit;

    @Value("${rate-limit.api.enhance-prompt:20}")
    private int promptLimit;

    @Value("${rate-limit.global:300}")
    private int globalLimit;

    private static final List<String> WHITELIST = List.of(
            "/actuator/health", "/v3/api-docs/**", "/swagger-ui/**"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        for (String pattern : WHITELIST) {
            if (pathMatcher.match(pattern, uri)) {
                return true;
            }
        }

        String ip = extractClientIp(request);
        String userId = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous";
        String apiKey = request.getHeader("X-API-Key");

        boolean allowed = true;

        if (pathMatcher.match("/api/v1/auth/login", uri)) {
            allowed = checkRateLimit("rate_limit:login:" + ip, loginLimit);
        } else if (pathMatcher.match("/api/v1/auth/register", uri)) {
            allowed = checkRateLimit("rate_limit:register:" + ip, registerLimit);
        } else if (pathMatcher.match("/api/v1/jobs/**", uri)) {
            String identifier = apiKey != null ? apiKey : userId;
            allowed = checkRateLimit("rate_limit:jobs:" + identifier, jobsLimit);
        } else if (pathMatcher.match("/api/v1/ai/enhance-prompt", uri)) {
            allowed = checkRateLimit("rate_limit:enhance:" + userId, promptLimit);
        } else {
            allowed = checkRateLimit("rate_limit:global:" + ip, globalLimit);
        }

        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Too Many Requests");
            errorResponse.put("message", "Rate limit exceeded. Try again later.");

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return false;
        }

        return true;
    }

    private boolean checkRateLimit(String key, int limit) {
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(60));
        }
        return count != null && count <= limit;
    }

    private String extractClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        } else {
            ip = ip.split(",")[0];
        }
        return ip;
    }
}
