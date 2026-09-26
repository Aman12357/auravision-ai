package com.aura.workspace.service;

import com.aura.video.dto.VideoGenerationRequest;
import com.aura.workspace.dto.CreditTransactionDto;
import com.aura.workspace.entity.Workspace;
import com.aura.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreditService {
    private final WorkspaceRepository workspaceRepository;

    @Transactional(readOnly = true)
    public long getBalance(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId).map(Workspace::getCreditsBalance).orElse(0L);
    }

    public void debitCredits(UUID workspaceId, UUID userId, long amount, String description, String refId, String refType) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        if (workspace.getCreditsBalance() < amount) {
            throw new RuntimeException("Insufficient credits");
        }
        workspace.setCreditsBalance(workspace.getCreditsBalance() - amount);
        workspaceRepository.save(workspace);
        // Normally insert into a credit_transactions table here
    }

    public void creditCredits(UUID workspaceId, UUID userId, long amount, String type, String description, String refId) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        workspace.setCreditsBalance(workspace.getCreditsBalance() + amount);
        workspaceRepository.save(workspace);
    }

    @Transactional(readOnly = true)
    public Page<CreditTransactionDto> getTransactionHistory(UUID workspaceId, Pageable pageable) {
        return Page.empty(); // Stub
    }

    public int estimateJobCost(VideoGenerationRequest request) {
        // Simple mock estimation logic
        int base = 10;
        int durationFactor = request.duration() != null ? request.duration() : 5;
        return base * durationFactor;
    }
}
