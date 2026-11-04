package com.taihexing.homeservice.model;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; private String orderNo; private Long serviceId; private String serviceName;
    private String customerName; private String phone; private String address; private String scheduledAt;
    private String note; private Integer amount; private String status; private Long providerId; private String providerName;
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
    protected Order() {}
    public Order(Long id,String orderNo,Long serviceId,String serviceName,String customerName,String phone,String address,String scheduledAt,String note,Integer amount,String status){this.id=id;this.orderNo=orderNo;this.serviceId=serviceId;this.serviceName=serviceName;this.customerName=customerName;this.phone=phone;this.address=address;this.scheduledAt=scheduledAt;this.note=note;this.amount=amount;this.status=status;}
    public Long getId(){return id;} public String getOrderNo(){return orderNo;} public Long getServiceId(){return serviceId;} public String getServiceName(){return serviceName;} public String getCustomerName(){return customerName;} public String getPhone(){return phone;} public String getAddress(){return address;} public String getScheduledAt(){return scheduledAt;} public String getNote(){return note;} public Integer getAmount(){return amount;} public String getStatus(){return status;} public Long getProviderId(){return providerId;} public String getProviderName(){return providerName;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
    public void assignProvider(Long id,String name){providerId=id;providerName=name;status="待上门";updatedAt=LocalDateTime.now();}
    public void updateStatus(String value){status=value;updatedAt=LocalDateTime.now();}
    @PrePersist void onCreate(){createdAt=LocalDateTime.now();updatedAt=createdAt;}
    @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
}
