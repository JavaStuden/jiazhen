package com.taihexing.homeservice.dto;

public record OrderActionRequest(
        Long providerId,
        String checkinAddress,
        String anomalyReason,
        String anomalyTargetDuration,
        Integer anomalyTargetAmount,
        Boolean agreed,
        Integer reviewScore,
        String reviewContent,
        String afterSalesReason
) {}
