package com.taihexing.homeservice.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "providers")
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String avatar;
    private Integer creditScore;
    private String status;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> skills = new ArrayList<>();

    private Integer completedOrders;
    private Double rating;
    private String goodRate;
    private Integer experienceYears;
    private Integer hourlyPrice;
    private String distance;
    private Boolean healthCertValid;
    private String skillCertValidUntil;
    private String wechatOpenId;

    protected Provider() {}

    public Provider(
            Long id,
            String name,
            String avatar,
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
    ) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.creditScore = creditScore;
        this.status = status;
        this.skills = skills != null ? new ArrayList<>(skills) : new ArrayList<>();
        this.completedOrders = completedOrders;
        this.rating = rating;
        this.goodRate = goodRate;
        this.experienceYears = experienceYears;
        this.hourlyPrice = hourlyPrice;
        this.distance = distance;
        this.healthCertValid = healthCertValid;
        this.skillCertValidUntil = skillCertValidUntil;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAvatar() { return avatar; }
    public Integer getCreditScore() { return creditScore; }
    public String getStatus() { return status; }
    public List<String> getSkills() { return skills; }
    public Integer getCompletedOrders() { return completedOrders; }
    public Double getRating() { return rating != null ? rating : 4.9; }
    public String getGoodRate() { return goodRate != null ? goodRate : "98%"; }
    public Integer getExperienceYears() { return experienceYears != null ? experienceYears : 6; }
    public Integer getHourlyPrice() { return hourlyPrice != null ? hourlyPrice : 42; }
    public String getDistance() { return distance != null ? distance : "1.2km"; }
    public Boolean getHealthCertValid() { return healthCertValid != null ? healthCertValid : Boolean.TRUE; }
    public String getSkillCertValidUntil() { return skillCertValidUntil != null ? skillCertValidUntil : "2028-05-16"; }
    @JsonIgnore public String getWechatOpenId() { return wechatOpenId; }
    public boolean isWechatBound() { return wechatOpenId != null && !wechatOpenId.isBlank(); }
    public void setWechatOpenId(String wechatOpenId) { this.wechatOpenId = wechatOpenId; }

    public void updateFrom(
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
    ) {
        if (name != null) this.name = name;
        if (creditScore != null) this.creditScore = creditScore;
        if (status != null) this.status = status;
        if (skills != null) this.skills = new ArrayList<>(skills);
        if (completedOrders != null) this.completedOrders = completedOrders;
        if (rating != null) this.rating = rating;
        if (goodRate != null) this.goodRate = goodRate;
        if (experienceYears != null) this.experienceYears = experienceYears;
        if (hourlyPrice != null) this.hourlyPrice = hourlyPrice;
        if (distance != null) this.distance = distance;
        if (healthCertValid != null) this.healthCertValid = healthCertValid;
        if (skillCertValidUntil != null) this.skillCertValidUntil = skillCertValidUntil;
    }
}
