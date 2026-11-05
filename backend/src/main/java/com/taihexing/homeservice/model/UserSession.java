package com.taihexing.homeservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "user_sessions")
public class UserSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String openId;
    private String accessToken;
    private String role;
    private String phone;
    private String displayName;
    @Column(length = 12000)
    private String accountData;

    protected UserSession() {}

    public UserSession(String openId, String accessToken, String role) {
        this.openId = openId;
        this.accessToken = accessToken;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getOpenId() { return openId; }
    public String getAccessToken() { return accessToken; }
    public String getRole() { return role; }
    public String getPhone() { return phone; }
    public String getDisplayName() { return displayName; }
    public String getAccountData() { return accountData; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public void setRole(String role) { this.role = role; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setAccountData(String accountData) { this.accountData = accountData; }
}
