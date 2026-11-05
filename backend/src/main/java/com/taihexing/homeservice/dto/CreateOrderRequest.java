package com.taihexing.homeservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull Long serviceId,
        String serviceName,
        String category,
        String area,
        String durationLabel,
        @NotBlank String address,
        @NotBlank String scheduledAt,
        String note,
        Integer amount,
        Double technicalFee,
        Integer couponDiscount,
        Double urgentFee,
        String paymentMethod
) {}
