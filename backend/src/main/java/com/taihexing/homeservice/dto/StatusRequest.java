package com.taihexing.homeservice.dto;
import jakarta.validation.constraints.NotBlank;
public record StatusRequest(@NotBlank String status) {}
