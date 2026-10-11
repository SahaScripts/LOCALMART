package com.localmarketplace.dto;

import com.localmarketplace.entity.Business;
import com.localmarketplace.entity.User;

public class AuthResponse {

    private Integer userId;
    private String fullName;
    private String email;
    private String role;
    private String accountStatus;
    private String phone;
    private String address;

    private Integer businessId;
    private String businessName;
    private String verificationStatus;
    private String message;

    public AuthResponse() {
    }

    public static AuthResponse fromUser(User user) {
        AuthResponse resp = new AuthResponse();
        resp.setUserId(user.getUserId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        resp.setAccountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
        resp.setPhone(user.getPhone());
        resp.setAddress(user.getAddress());
        return resp;
    }

    public static AuthResponse fromUserAndBusiness(User user, Business business) {
        AuthResponse resp = fromUser(user);
        if (business != null) {
            resp.setBusinessId(business.getBusinessId());
            resp.setBusinessName(business.getBusinessName());
            resp.setVerificationStatus(business.getVerificationStatus() != null ? business.getVerificationStatus().name() : "PENDING");
        }
        return resp;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Integer businessId) {
        this.businessId = businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
