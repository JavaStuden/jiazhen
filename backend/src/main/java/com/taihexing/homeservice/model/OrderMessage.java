package com.taihexing.homeservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_messages")
public class OrderMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long orderId;
    private String senderRole;
    private String senderName;
    @Column(length = 2000, nullable = false) private String content;
    private LocalDateTime createdAt;

    protected OrderMessage() {}
    public OrderMessage(Long orderId, String senderRole, String senderName, String content) {
        this.orderId = orderId;
        this.senderRole = senderRole;
        this.senderName = senderName;
        this.content = content;
    }
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public String getSenderRole() { return senderRole; }
    public String getSenderName() { return senderName; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
