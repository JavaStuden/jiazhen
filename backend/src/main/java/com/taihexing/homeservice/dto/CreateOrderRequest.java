package com.taihexing.homeservice.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record CreateOrderRequest(@NotNull Long serviceId, @NotBlank String customerName, @NotBlank String phone, @NotBlank String address, @NotBlank String scheduledAt, String note) {}
