package com.aura.payment.dto;

import com.aura.payment.entity.Plan;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record PlanDto(
        UUID id,
        String name,
        String displayName,
        String description,
        BigDecimal priceMonthly,
        BigDecimal priceYearly,
        String currency,
        Integer creditsMonthly,
        String maxResolution,
        Integer maxDurationSeconds,
        Integer maxTeamMembers,
        Integer storageGb,
        List<String> features,
        boolean isActive,
        int sortOrder
) {
    public static PlanDto fromPlan(Plan p) {
        List<String> featureList = new ArrayList<>();
        if (p.getFeatures() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                featureList = mapper.readValue(p.getFeatures(), new TypeReference<List<String>>(){});
            } catch (JsonProcessingException e) {
                // Ignore or log error
            }
        }
        
        return new PlanDto(
                p.getId(),
                p.getName(),
                p.getDisplayName(),
                p.getDescription(),
                p.getPriceMonthly(),
                p.getPriceYearly(),
                p.getCurrency(),
                p.getCreditsMonthly(),
                p.getMaxResolution(),
                p.getMaxDurationSeconds(),
                p.getMaxTeamMembers(),
                p.getStorageGb(),
                featureList,
                p.isActive(),
                p.getSortOrder()
        );
    }
}
