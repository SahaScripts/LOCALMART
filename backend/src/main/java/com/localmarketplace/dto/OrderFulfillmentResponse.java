package com.localmarketplace.dto;

import java.time.LocalDateTime;

public class OrderFulfillmentResponse {

    private Integer fulfillmentId;
    private Integer orderId;
    private Integer businessId;
    private String businessName;
    private String businessAddress;
    private String businessPhone;
    private String deliveryMethod;
    private String pickupLocation;
    private String deliveryAddress;
    private String status;
    private LocalDateTime createdAt;

    public OrderFulfillmentResponse() {
    }

    public OrderFulfillmentResponse(
            Integer fulfillmentId,
            Integer orderId,
            Integer businessId,
            String businessName,
            String businessAddress,
            String businessPhone,
            String deliveryMethod,
            String pickupLocation,
            String deliveryAddress,
            String status,
            LocalDateTime createdAt
    ) {
        this.fulfillmentId = fulfillmentId;
        this.orderId = orderId;
        this.businessId = businessId;
        this.businessName = businessName;
        this.businessAddress = businessAddress;
        this.businessPhone = businessPhone;
        this.deliveryMethod = deliveryMethod;
        this.pickupLocation = pickupLocation;
        this.deliveryAddress = deliveryAddress;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getFulfillmentId() {
        return fulfillmentId;
    }

    public void setFulfillmentId(Integer fulfillmentId) {
        this.fulfillmentId = fulfillmentId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
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

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }

    public String getBusinessPhone() {
        return businessPhone;
    }

    public void setBusinessPhone(String businessPhone) {
        this.businessPhone = businessPhone;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(String deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
