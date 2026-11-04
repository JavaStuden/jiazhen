package com.taihexing.homeservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_items")
public class ServiceItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private String category;
    private String description;
    private Integer durationHours;
    private Integer price;
    private boolean active;
    protected ServiceItem() {}
    public ServiceItem(Long id,String name,String category,String description,Integer durationHours,Integer price,boolean active){this.id=id;this.name=name;this.category=category;this.description=description;this.durationHours=durationHours;this.price=price;this.active=active;}
    public Long getId(){return id;} public String getName(){return name;} public String getCategory(){return category;} public String getDescription(){return description;} public Integer getDurationHours(){return durationHours;} public Integer getPrice(){return price;} public boolean isActive(){return active;}
}
