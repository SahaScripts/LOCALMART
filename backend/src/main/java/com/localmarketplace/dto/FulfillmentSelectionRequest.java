package com.localmarketplace.dto;

public class FulfillmentSelectionRequest {

    private Integer businessId;
    private String deliveryMethod; // "SELLER_DELIVERY" or "SELF_PICKUP"
    private String pickupLocation;
    private String deliveryAddress;

    public FulfillmentSelectionRequest() {
    }

    public FulfillmentSelectionRequest(Integer businessId, String deliveryMethod, String pickupLocation, String deliveryAddress) {
        this.businessId = businessId;
        this.deliveryMethod = deliveryMethod;
        this.pickupLocation = pickupLocation;
        this.deliveryAddress = deliveryAddress;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Integer businessId) {
        this.businessId = businessId;
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
}
