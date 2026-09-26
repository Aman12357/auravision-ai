package com.aura.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
@Slf4j
public class AuditInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTR = "startTime";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method) || request.getRequestURI().startsWith("/actuator/health")) {
            return; // Skip non-mutating and health check endpoints
        }

        long duration = System.currentTimeMillis() - (Long) request.getAttribute(START_TIME_ATTR);
        int status = response.getStatus();
        String uri = request.getRequestURI();
        String ip = request.getHeader("X-Forwarded-For") != null ? request.getHeader("X-Forwarded-For") : request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        String userId = "anonymous";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            userId = auth.getName();
        }

        // Normally you would save this via an AuditLogService asynchronously
        // auditLogService.save(new AuditLog(userId, method, uri, ip, userAgent, status, duration));
        log.info("AUDIT | User: {} | Method: {} | URI: {} | Status: {} | Duration: {}ms | IP: {} | UA: {}",
                userId, method, uri, status, duration, ip, userAgent);
    }
}
