package com.aura.payment.repository;

import com.aura.payment.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByWorkspaceIdAndStatus(UUID workspaceId, String status);
    List<Subscription> findByWorkspaceId(UUID workspaceId);
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}
