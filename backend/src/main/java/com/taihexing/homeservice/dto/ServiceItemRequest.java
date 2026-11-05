package com.taihexing.homeservice.dto;

import java.util.List;

public record ServiceItemRequest(
        String name,
        String category,
        String description,
        String area,
        Integer durationHours,
        String durationLabel,
        String typeTag,
        Integer price,
        Double technicalFee,
        Boolean active,
        List<String> tags,
        List<String> sectionEntries,
        List<String> includedItems,
        String disclaimer
) {}
