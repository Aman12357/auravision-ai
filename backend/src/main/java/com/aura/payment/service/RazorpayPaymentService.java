package com.aura.payment.service;

import com.aura.payment.entity.Plan;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Subscription;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class RazorpayPaymentService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() {
        try {
            client = new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client", e);
        }
    }

    public String createSubscription(Plan plan, String billingCycle, UUID workspaceId) {
        try {
            String planId = "monthly".equalsIgnoreCase(billingCycle) ? plan.getRazorpayMonthlyPlanId() : plan.getRazorpayYearlyPlanId();
            
            JSONObject options = new JSONObject();
            options.put("plan_id", planId);
            options.put("total_count", 120); // up to 10 years for monthly
            options.put("quantity", 1);
            options.put("customer_notify", 1);

            JSONObject notes = new JSONObject();
            notes.put("workspaceId", workspaceId.toString());
            notes.put("billingCycle", billingCycle);
            options.put("notes", notes);

            Subscription subscription = client.subscriptions.create(options);
            return subscription.get("id").toString();
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay subscription for workspace {}", workspaceId, e);
            throw new RuntimeException("Razorpay subscription failed", e);
        }
    }

    public JSONObject createOrder(int amountCents, String currency, UUID workspaceId) {
        try {
            JSONObject options = new JSONObject();
            options.put("amount", amountCents);
            options.put("currency", currency);
            options.put("receipt", "txn_" + System.currentTimeMillis());

            JSONObject notes = new JSONObject();
            notes.put("workspaceId", workspaceId.toString());
            options.put("notes", notes);

            Order order = client.orders.create(options);
            return new JSONObject(order.toString());
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for workspace {}", workspaceId, e);
            throw new RuntimeException("Razorpay order failed", e);
        }
    }

    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }

    public void handleSubscriptionActivated(String subscriptionId) {
        log.info("Razorpay subscription activated: {}", subscriptionId);
        // Business logic to update status to ACTIVE
    }

    public void handlePaymentCaptured(String paymentId) {
        log.info("Razorpay payment captured: {}", paymentId);
        // Business logic to grant credits
    }
}
