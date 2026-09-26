package com.aura.workspace.controller;

import com.aura.common.response.ApiResponse;
import com.aura.video.dto.VideoGenerationRequest;
import com.aura.workspace.dto.CreditTransactionDto;
import com.aura.workspace.service.CreditService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/credits")
@Tag(name="Credits")
@RequiredArgsConstructor
public class CreditController {
    private final CreditService creditService;

    @GetMapping("/balance")
    public ApiResponse<Long> getBalance(@RequestHeader("X-Workspace-Id") UUID workspaceId) {
        return ApiResponse.success(creditService.getBalance(workspaceId));
    }

    @GetMapping("/transactions")
    public ApiResponse<Page<CreditTransactionDto>> getTransactionHistory(@RequestHeader("X-Workspace-Id") UUID workspaceId,
                                                                         Pageable pageable) {
        return ApiResponse.success(creditService.getTransactionHistory(workspaceId, pageable));
    }

    @PostMapping("/estimate")
    public ApiResponse<Integer> estimateJobCost(@RequestBody VideoGenerationRequest request) {
        return ApiResponse.success(creditService.estimateJobCost(request));
    }
}
