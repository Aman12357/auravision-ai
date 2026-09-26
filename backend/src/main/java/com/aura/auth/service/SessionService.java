package com.aura.auth.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_PREFIX = "user_sessions:";
    private static final long SESSION_TTL_DAYS = 30;

    public SessionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public record SessionData(UUID userId, String deviceInfo, String ip, ZonedDateTime createdAt, ZonedDateTime lastAccessedAt) {}

    public String createSession(UUID userId, String deviceInfo, String ip) {
        String sessionId = UUID.randomUUID().toString();
        String sessionKey = SESSION_KEY_PREFIX + sessionId;
        String userSessionsKey = USER_SESSIONS_PREFIX + userId.toString();
        
        SessionData sessionData = new SessionData(userId, deviceInfo, ip, ZonedDateTime.now(), ZonedDateTime.now());
        
        redisTemplate.opsForValue().set(sessionKey, sessionData, SESSION_TTL_DAYS, TimeUnit.DAYS);
        redisTemplate.opsForSet().add(userSessionsKey, sessionId);
        
        return sessionId;
    }

    public Optional<SessionData> getSession(String sessionId) {
        String sessionKey = SESSION_KEY_PREFIX + sessionId;
        SessionData data = (SessionData) redisTemplate.opsForValue().get(sessionKey);
        return Optional.ofNullable(data);
    }

    public void invalidateSession(String sessionId) {
        Optional<SessionData> sessionDataOpt = getSession(sessionId);
        if (sessionDataOpt.isPresent()) {
            SessionData data = sessionDataOpt.get();
            String userSessionsKey = USER_SESSIONS_PREFIX + data.userId().toString();
            redisTemplate.opsForSet().remove(userSessionsKey, sessionId);
            redisTemplate.delete(SESSION_KEY_PREFIX + sessionId);
        }
    }

    public void invalidateAllUserSessions(UUID userId) {
        String userSessionsKey = USER_SESSIONS_PREFIX + userId.toString();
        Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);
        
        if (sessionIds != null) {
            for (Object sessionIdObj : sessionIds) {
                String sessionId = (String) sessionIdObj;
                redisTemplate.delete(SESSION_KEY_PREFIX + sessionId);
            }
        }
        redisTemplate.delete(userSessionsKey);
    }

    public List<SessionData> getActiveSessions(UUID userId) {
        String userSessionsKey = USER_SESSIONS_PREFIX + userId.toString();
        Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);
        List<SessionData> activeSessions = new ArrayList<>();
        
        if (sessionIds != null) {
            for (Object sessionIdObj : sessionIds) {
                String sessionId = (String) sessionIdObj;
                Optional<SessionData> sessionDataOpt = getSession(sessionId);
                sessionDataOpt.ifPresent(activeSessions::add);
            }
        }
        
        return activeSessions;
    }

    public void refreshSession(String sessionId) {
        Optional<SessionData> sessionDataOpt = getSession(sessionId);
        if (sessionDataOpt.isPresent()) {
            SessionData oldData = sessionDataOpt.get();
            SessionData newData = new SessionData(oldData.userId(), oldData.deviceInfo(), oldData.ip(), oldData.createdAt(), ZonedDateTime.now());
            redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + sessionId, newData, SESSION_TTL_DAYS, TimeUnit.DAYS);
        }
    }
}
