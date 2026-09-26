package com.aura.payment.service;

import com.aura.user.entity.User;
import com.aura.workspace.entity.Workspace;
import com.aura.payment.entity.Plan;
import com.aura.payment.entity.Subscription;
import com.aura.workspace.service.CreditService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripePaymentService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final CreditService creditService;
    // Assume SubscriptionRepository and other necessary beans are injected

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public String createCustomer(User user) {
        try {
            CustomerCreateParams params = CustomerCreateParams.builder()
                    .setEmail(user.getEmail())
                    .setName(user.getFirstName() + " " + user.getLastName())
                    .putMetadata("userId", user.getId().toString())
                    .build();

            com.stripe.model.Customer customer = com.stripe.model.Customer.create(params);
            return customer.getId();
        } catch (StripeException e) {
            log.error("Failed to create Stripe customer for user {}", user.getId(), e);
            throw new RuntimeException("Payment service unavailable", e);
        }
    }

    public String createCheckoutSession(Workspace workspace, Plan plan, String billingCycle, String successUrl, String cancelUrl) {
        try {
            String priceId = "monthly".equalsIgnoreCase(billingCycle) ? plan.getStripeMonthlyPriceId() : plan.getStripeYearlyPriceId();

            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPrice(priceId)
                                    .setQuantity(1L)
                                    .build()
                    )
                    .setCustomer(workspace.getOwner().getStripeCustomerId())
                    .putMetadata("workspaceId", workspace.getId().toString())
                    .putMetadata("planId", plan.getId().toString())
                    .putMetadata("billingCycle", billingCycle)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .setAllowPromotionCodes(true);

            if (plan.getTrialDays() != null && plan.getTrialDays() > 0) {
                builder.setSubscriptionData(
                        SessionCreateParams.SubscriptionData.builder()
                                .setTrialPeriodDays(plan.getTrialDays().longValue())
                                .build()
                );
            }

            Session session = Session.create(builder.build());
            return session.getUrl();
        } catch (StripeException e) {
            log.error("Failed to create checkout session for workspace {}", workspace.getId(), e);
            throw new RuntimeException("Failed to initiate payment", e);
        }
    }

    public String createCreditPurchaseSession(Workspace workspace, int credits, String successUrl) {
        try {
            long amountCents;
            if (credits <= 500) amountCents = 499L;
            else if (credits <= 2000) amountCents = 1499L;
            else amountCents = 4999L;

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(amountCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(credits + " Credits Top-up")
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .setQuantity(1L)
                                    .build()
                    )
                    .setCustomer(workspace.getOwner().getStripeCustomerId())
                    .putMetadata("workspaceId", workspace.getId().toString())
                    .putMetadata("credits", String.valueOf(credits))
                    .setSuccessUrl(successUrl)
                    .build();

            Session session = Session.create(params);
            return session.getUrl();
        } catch (StripeException e) {
            log.error("Failed to create credit purchase session", e);
            throw new RuntimeException("Failed to initiate credit purchase", e);
        }
    }

    public Event constructWebhookEvent(String payload, String sigHeader) {
        try {
            return Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature", e);
            throw new RuntimeException("Invalid signature", e);
        }
    }

    public void handleSubscriptionCreated(String stripeSubId) {
        log.info("Stripe subscription created: {}", stripeSubId);
        // Implement logic: retrieve subscription, find workspace, grant credits
        // e.g. creditService.addCredits(workspaceId, credits, "SUBSCRIPTION_CREATED");
    }

    public void handleSubscriptionUpdated(String stripeSubId) {
        log.info("Stripe subscription updated: {}", stripeSubId);
        // Implement logic: update DB status and period ends
    }

    public void handleSubscriptionDeleted(String stripeSubId) {
        log.info("Stripe subscription deleted: {}", stripeSubId);
        // Implement logic: downgrade to FREE plan
    }

    public void handleInvoicePaid(String invoiceId) {
        log.info("Stripe invoice paid: {}", invoiceId);
        // Implement logic: create Payment/Invoice record, grant credits for period
    }

    public void handleInvoicePaymentFailed(String invoiceId) {
        log.info("Stripe invoice payment failed: {}", invoiceId);
        // Implement logic: mark PAST_DUE
    }
}
