package com.taihexing.homeservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "service_orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String orderNo;
    private Long serviceId;
    private String serviceName;
    private String category;
    private String area;
    private String durationLabel;
    private String customerName;
    private String phone;
    private String address;
    private String scheduledAt;
    @Column(length = 500)
    private String note;
    private Integer amount;
    private Double technicalFee;
    private Integer couponDiscount;
    private Double urgentFee;
    private Double payableAmount;
    private String paymentMethod;
    private String status;
    private Long providerId;
    private String providerName;
    private String customerOpenId;

    private String checkinTime;
    private String checkinAddress;
    private String startServiceTime;
    private String completeTime;

    private String anomalyStatus;
    @Column(length = 500)
    private String anomalyReason;
    private String anomalyTargetDuration;
    private Integer anomalyTargetAmount;

    private Integer reviewScore;
    @Column(length = 500)
    private String reviewContent;
    private String afterSalesStatus;
    @Column(length = 500)
    private String afterSalesReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Order() {}

    public Order(
            Long id,
            String orderNo,
            Long serviceId,
            String serviceName,
            String category,
            String area,
            String durationLabel,
            String customerName,
            String phone,
            String address,
            String scheduledAt,
            String note,
            Integer amount,
            Double technicalFee,
            Integer couponDiscount,
            Double urgentFee,
            Double payableAmount,
            String paymentMethod,
            String status
    ) {
        this.id = id;
        this.orderNo = orderNo;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.category = category;
        this.area = area;
        this.durationLabel = durationLabel;
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.scheduledAt = scheduledAt;
        this.note = note;
        this.amount = amount;
        this.technicalFee = technicalFee != null ? technicalFee : 9.9;
        this.couponDiscount = couponDiscount != null ? couponDiscount : 0;
        this.urgentFee = urgentFee != null ? urgentFee : 0.0;
        this.payableAmount = payableAmount != null
                ? payableAmount
                : Math.max(0, (amount != null ? amount : 0) - this.couponDiscount) + this.technicalFee + this.urgentFee;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "微信支付";
        this.status = status;
        this.anomalyStatus = "无";
        this.afterSalesStatus = "无";
    }

    public Long getId() { return id; }
    public String getOrderNo() { return orderNo; }
    public Long getServiceId() { return serviceId; }
    public String getServiceName() { return serviceName; }
    public String getCategory() { return category; }
    public String getArea() { return area; }
    public String getDurationLabel() { return durationLabel; }
    public String getCustomerName() { return customerName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getMaskedAddress() {
        if (address == null || address.isBlank()) return "";
        int cityEnd = address.indexOf("市");
        int districtEnd = address.indexOf("区");
        int keepThrough = districtEnd >= 0 ? districtEnd + 1 : (cityEnd >= 0 ? cityEnd + 1 : 0);
        return address.substring(0, keepThrough) + "（详细地址接单后查看）";
    }
    public String getScheduledAt() { return scheduledAt; }
    public String getNote() { return note; }
    public Integer getAmount() { return amount; }
    public Double getTechnicalFee() { return technicalFee != null ? technicalFee : 9.9; }
    public Integer getCouponDiscount() { return couponDiscount != null ? couponDiscount : 0; }
    public Double getUrgentFee() { return urgentFee != null ? urgentFee : 0.0; }
    public Double getPayableAmount() { return payableAmount != null ? payableAmount : (amount != null ? amount.doubleValue() : 0.0); }
    public String getPaymentMethod() { return paymentMethod != null ? paymentMethod : "微信支付"; }
    public String getStatus() { return status; }
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getCustomerOpenId() { return customerOpenId; }
    public void setCustomerOpenId(String customerOpenId) { this.customerOpenId = customerOpenId; }
    public String getCheckinTime() { return checkinTime; }
    public String getCheckinAddress() { return checkinAddress; }
    public String getStartServiceTime() { return startServiceTime; }
    public String getCompleteTime() { return completeTime; }
    public String getAnomalyStatus() { return anomalyStatus != null ? anomalyStatus : "无"; }
    public String getAnomalyReason() { return anomalyReason; }
    public String getAnomalyTargetDuration() { return anomalyTargetDuration; }
    public Integer getAnomalyTargetAmount() { return anomalyTargetAmount; }
    public Integer getReviewScore() { return reviewScore; }
    public String getReviewContent() { return reviewContent; }
    public String getAfterSalesStatus() { return afterSalesStatus != null ? afterSalesStatus : "无"; }
    public String getAfterSalesReason() { return afterSalesReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void assignProvider(Long id, String name) {
        this.providerId = id;
        this.providerName = name;
        this.status = "待上门";
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatus(String value) {
        this.status = value;
        if ("服务中".equals(value) && this.startServiceTime == null) {
            this.startServiceTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        }
        if (("待结算".equals(value) || "已完成".equals(value)) && this.completeTime == null) {
            this.completeTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void recordCheckin(String checkinAddress) {
        if (!"待上门".equals(this.status)) throw new IllegalStateException("订单当前状态不可打卡");
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        this.checkinTime = nowStr;
        this.startServiceTime = nowStr;
        this.checkinAddress = (checkinAddress != null && !checkinAddress.isBlank())
                ? checkinAddress
                : "距服务地址 12米 · 定位正常";
        this.status = "服务中";
        this.updatedAt = LocalDateTime.now();
    }

    public void reportAnomaly(String reason, String targetDuration, Integer targetAmount) {
        if (!"服务中".equals(this.status)) throw new IllegalStateException("仅服务中的订单可以上报异常");
        if (reason == null || reason.isBlank()) throw new IllegalArgumentException("请填写异常说明");
        this.anomalyStatus = "待确认";
        this.anomalyReason = reason;
        this.anomalyTargetDuration = targetDuration;
        this.anomalyTargetAmount = targetAmount;
        this.updatedAt = LocalDateTime.now();
    }

    public void confirmAnomaly(boolean agreed) {
        if (!"待确认".equals(this.anomalyStatus)) throw new IllegalStateException("没有待确认的时长调整");
        if (agreed) {
            this.anomalyStatus = "已同意";
            if (this.anomalyTargetDuration != null && !this.anomalyTargetDuration.isBlank()) {
                this.durationLabel = this.durationLabel + "（" + this.anomalyTargetDuration + "）";
            }
            if (this.anomalyTargetAmount != null && this.anomalyTargetAmount > 0) {
                this.amount = this.anomalyTargetAmount;
                this.payableAmount = Math.max(0, this.amount - getCouponDiscount()) + getTechnicalFee() + getUrgentFee();
            }
        } else {
            this.anomalyStatus = "已拒绝";
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void submitReview(Integer score, String content) {
        if (!"待评价".equals(this.status)) throw new IllegalStateException("当前订单不可评价");
        this.reviewScore = score != null ? score : 5;
        this.reviewContent = content;
        this.status = "已完成";
        this.updatedAt = LocalDateTime.now();
    }

    public void submitAfterSales(String reason) {
        if ("已取消".equals(this.status) || "处理中".equals(this.afterSalesStatus)) throw new IllegalStateException("当前订单不可重复申请售后");
        this.afterSalesStatus = "处理中";
        this.afterSalesReason = reason;
        this.updatedAt = LocalDateTime.now();
    }

    public void cancelAfterSales() {
        if (!"处理中".equals(this.afterSalesStatus)) throw new IllegalStateException("当前售后申请不可撤销");
        this.afterSalesStatus = "已撤销";
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
