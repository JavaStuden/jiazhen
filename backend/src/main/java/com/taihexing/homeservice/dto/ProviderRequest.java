package com.taihexing.homeservice.dto;

import java.util.List;

public record ProviderRequest(
        String name,
        Integer creditScore,
        String status,
        List<String> skills,
        Integer completedOrders,
        Double rating,
        String goodRate,
        Integer experienceYears,
        Integer hourlyPrice,
        String distance,
        Boolean healthCertValid,
        String skillCertValidUntil
) {}
