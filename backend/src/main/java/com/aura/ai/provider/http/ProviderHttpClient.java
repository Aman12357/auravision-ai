package com.aura.ai.provider.http;

import com.aura.ai.provider.ProviderException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class ProviderHttpClient {

    private final RestTemplate restTemplate;

    public ProviderHttpClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(factory);
    }

    public <T> T post(String providerName, String url, Object body, HttpHeaders headers, Class<T> responseType) {
        return execute(providerName, url, HttpMethod.POST, body, headers, responseType);
    }

    public <T> T get(String providerName, String url, HttpHeaders headers, Class<T> responseType) {
        return execute(providerName, url, HttpMethod.GET, null, headers, responseType);
    }

    public <T> T postWithRetry(String providerName, String url, Object body, HttpHeaders headers, Class<T> responseType) {
        int maxRetries = 3;
        int backoff = 1000;
        
        for (int i = 0; i < maxRetries; i++) {
            try {
                return post(providerName, url, body, headers, responseType);
            } catch (ProviderException e) {
                if (e.isRetryable() && i < maxRetries - 1) {
                    log.warn("Retryable error for provider {}, attempt {}. Retrying in {}ms...", providerName, i + 1, backoff);
                    try {
                        Thread.sleep(backoff);
                        backoff *= 2; // exponential
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new ProviderException(providerName, "INTERRUPTED", "Thread interrupted during retry backoff", false, ie);
                    }
                } else {
                    throw e;
                }
            }
        }
        throw new ProviderException(providerName, "MAX_RETRIES_EXCEEDED", "Max retries exceeded", false);
    }

    private <T> T execute(String providerName, String url, HttpMethod method, Object body, HttpHeaders headers, Class<T> responseType) {
        log.debug("Executing {} to {} for provider {}", method, url, providerName);
        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<T> response = restTemplate.exchange(url, method, entity, responseType);
            log.debug("Response from {}: {}", providerName, response.getStatusCode());
            return response.getBody();
            
        } catch (HttpClientErrorException.TooManyRequests e) {
            String retryAfter = e.getResponseHeaders() != null ? e.getResponseHeaders().getFirst("Retry-After") : null;
            log.warn("Rate limited by provider {}. Retry-After: {}", providerName, retryAfter);
            throw new ProviderException(providerName, "RATE_LIMIT", "Too Many Requests", true, e);
            
        } catch (HttpClientErrorException e) {
            log.error("Client error from provider {}: {} - {}", providerName, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ProviderException(providerName, "CLIENT_ERROR", "Client error: " + e.getStatusCode(), false, e);
            
        } catch (HttpServerErrorException e) {
            log.error("Server error from provider {}: {} - {}", providerName, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ProviderException(providerName, "SERVER_ERROR", "Server error: " + e.getStatusCode(), true, e);
            
        } catch (Exception e) {
            log.error("Unknown error executing request to provider {}", providerName, e);
            throw new ProviderException(providerName, "UNKNOWN_ERROR", "Unknown error occurred", true, e);
        }
    }
}
