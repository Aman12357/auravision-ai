package com.aura.payment.repository;

import com.aura.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Page<Payment> findByWorkspaceId(UUID workspaceId, Pageable pageable);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
}
