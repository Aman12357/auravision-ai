package com.aura.payment.service;

import com.aura.payment.entity.Plan;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class PayPalPaymentService {

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.client-secret}")
    private String clientSecret;

    @Value("${paypal.base-url:https://api-m.sandbox.paypal.com}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, String> tokenCache = new ConcurrentHashMap<>();
    private long tokenExpiry = 0;

    public String getAccessToken() {
        if (System.currentTimeMillis() < tokenExpiry && tokenCache.containsKey("token")) {
            return tokenCache.get("token");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/v1/oauth2/token",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                String token = (String) responseBody.get("access_token");
                int expiresIn = (Integer) responseBody.get("expires_in");
                tokenCache.put("token", token);
                tokenExpiry = System.currentTimeMillis() + ((expiresIn - 60) * 1000L); // 60s buffer
                return token;
            }
        } catch (Exception e) {
            log.error("Failed to get PayPal access token", e);
            throw new RuntimeException("PayPal auth failed", e);
        }
        return null;
    }

    public String createSubscription(Plan plan, String billingCycle, String returnUrl, String cancelUrl) {
        String token = getAccessToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String planId = "monthly".equalsIgnoreCase(billingCycle) ? plan.getPaypalMonthlyPlanId() : plan.getPaypalYearlyPlanId();

        Map<String, Object> applicationContext = new HashMap<>();
        applicationContext.put("return_url", returnUrl);
        applicationContext.put("cancel_url", cancelUrl);

        Map<String, Object> body = new HashMap<>();
        body.put("plan_id", planId);
        body.put("application_context", applicationContext);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/v1/billing/subscriptions",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                List<Map<String, String>> links = (List<Map<String, String>>) responseBody.get("links");
                for (Map<String, String> link : links) {
                    if ("approve".equals(link.get("rel"))) {
                        return link.get("href");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to create PayPal subscription", e);
            throw new RuntimeException("PayPal subscription failed", e);
        }
        return null;
    }

    public void captureSubscription(String subscriptionId) {
        String token = getAccessToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/v1/billing/subscriptions/" + subscriptionId,
                    HttpMethod.GET,
                    request,
                    Map.class
            );
            
            Map<String, Object> body = response.getBody();
            if (body != null) {
                String status = (String) body.get("status");
                if ("ACTIVE".equals(status)) {
                    log.info("PayPal subscription {} is ACTIVE", subscriptionId);
                    // Business logic to activate subscription in DB
                }
            }
        } catch (Exception e) {
            log.error("Failed to capture PayPal subscription {}", subscriptionId, e);
        }
    }
}
