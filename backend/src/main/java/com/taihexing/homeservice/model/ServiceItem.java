package com.taihexing.homeservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "service_items")
public class ServiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String category;
    private String description;
    private String area;
    private Integer durationHours;
    private String durationLabel;
    private String typeTag;
    private Integer price;
    private Double technicalFee;
    private boolean active;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(length = 200)
    private List<String> tags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(length = 500)
    private List<String> sectionEntries = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(length = 500)
    private List<String> includedItems = new ArrayList<>();

    @Column(length = 1000)
    private String disclaimer;

    protected ServiceItem() {}

    public ServiceItem(
            Long id,
            String name,
            String category,
            String description,
            String area,
            Integer durationHours,
            String durationLabel,
            String typeTag,
            Integer price,
            Double technicalFee,
            boolean active,
            List<String> tags,
            List<String> sectionEntries,
            List<String> includedItems,
            String disclaimer
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.area = area;
        this.durationHours = durationHours;
        this.durationLabel = durationLabel;
        this.typeTag = typeTag;
        this.price = price;
        this.technicalFee = technicalFee;
        this.active = active;
        this.tags = tags != null ? new ArrayList<>(tags) : new ArrayList<>();
        this.sectionEntries = sectionEntries != null ? new ArrayList<>(sectionEntries) : new ArrayList<>();
        this.includedItems = includedItems != null ? new ArrayList<>(includedItems) : new ArrayList<>();
        this.disclaimer = disclaimer;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getArea() { return area; }
    public Integer getDurationHours() { return durationHours; }
    public String getDurationLabel() {
        return durationLabel != null && !durationLabel.isBlank()
                ? durationLabel
                : (durationHours != null ? durationHours + "小时" : "3小时");
    }
    public String getTypeTag() { return typeTag; }
    public Integer getPrice() { return price; }
    public Double getTechnicalFee() { return technicalFee != null ? technicalFee : 9.9; }
    public boolean isActive() { return active; }
    public List<String> getTags() { return tags; }
    public List<String> getIncludedItems() { return includedItems; }
    public String getDisclaimer() { return disclaimer; }

    public List<Map<String, String>> getServiceSections() {
        List<Map<String, String>> result = new ArrayList<>();
        if (sectionEntries == null) return result;
        for (String entry : sectionEntries) {
            if (entry == null || entry.isBlank()) continue;
            int idx = entry.indexOf('|');
            Map<String, String> map = new LinkedHashMap<>();
            if (idx > 0) {
                map.put("area", entry.substring(0, idx).trim());
                map.put("detail", entry.substring(idx + 1).trim());
            } else {
                map.put("area", "服务内容");
                map.put("detail", entry.trim());
            }
            result.add(map);
        }
        return result;
    }

    public void updateFrom(
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
    ) {
        if (name != null) this.name = name;
        if (category != null) this.category = category;
        if (description != null) this.description = description;
        if (area != null) this.area = area;
        if (durationHours != null) this.durationHours = durationHours;
        if (durationLabel != null) this.durationLabel = durationLabel;
        if (typeTag != null) this.typeTag = typeTag;
        if (price != null) this.price = price;
        if (technicalFee != null) this.technicalFee = technicalFee;
        if (active != null) this.active = active;
        if (tags != null) this.tags = new ArrayList<>(tags);
        if (sectionEntries != null) this.sectionEntries = new ArrayList<>(sectionEntries);
        if (includedItems != null) this.includedItems = new ArrayList<>(includedItems);
        if (disclaimer != null) this.disclaimer = disclaimer;
    }
}
