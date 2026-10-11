package com.localmarketplace.dto;

import java.math.BigDecimal;

public class InventoryRecommendationResponse {

    private Integer productId;
    private String productName;
    private Integer businessId;
    private String businessName;
    private Integer currentStock;
    private Long unitsOrdered60d;
    private BigDecimal avgDailyDemand;
    private BigDecimal estimatedDaysRemaining;
    private String inventoryStatus;
    private Integer suggestedReorderQuantity;
    private String recommendation;

    public InventoryRecommendationResponse() {
    }

    public InventoryRecommendationResponse(
            Integer productId,
            String productName,
            Integer businessId,
            String businessName,
            Integer currentStock,
            Long unitsOrdered60d,
            BigDecimal avgDailyDemand,
            BigDecimal estimatedDaysRemaining,
            String inventoryStatus,
            Integer suggestedReorderQuantity,
            String recommendation) {

        this.productId = productId;
        this.productName = productName;
        this.businessId = businessId;
        this.businessName = businessName;
        this.currentStock = currentStock;
        this.unitsOrdered60d = unitsOrdered60d;
        this.avgDailyDemand = avgDailyDemand;
        this.estimatedDaysRemaining = estimatedDaysRemaining;
        this.inventoryStatus = inventoryStatus;
        this.suggestedReorderQuantity = suggestedReorderQuantity;
        this.recommendation = recommendation;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
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

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Long getUnitsOrdered60d() {
        return unitsOrdered60d;
    }

    public void setUnitsOrdered60d(Long unitsOrdered60d) {
        this.unitsOrdered60d = unitsOrdered60d;
    }

    public BigDecimal getAvgDailyDemand() {
        return avgDailyDemand;
    }

    public void setAvgDailyDemand(BigDecimal avgDailyDemand) {
        this.avgDailyDemand = avgDailyDemand;
    }

    public BigDecimal getEstimatedDaysRemaining() {
        return estimatedDaysRemaining;
    }

    public void setEstimatedDaysRemaining(BigDecimal estimatedDaysRemaining) {
        this.estimatedDaysRemaining = estimatedDaysRemaining;
    }

    public String getInventoryStatus() {
        return inventoryStatus;
    }

    public void setInventoryStatus(String inventoryStatus) {
        this.inventoryStatus = inventoryStatus;
    }

    public Integer getSuggestedReorderQuantity() {
        return suggestedReorderQuantity;
    }

    public void setSuggestedReorderQuantity(Integer suggestedReorderQuantity) {
        this.suggestedReorderQuantity = suggestedReorderQuantity;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}