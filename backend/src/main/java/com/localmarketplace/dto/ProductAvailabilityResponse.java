package com.localmarketplace.dto;

import java.math.BigDecimal;

public class ProductAvailabilityResponse {

    private Integer productId;
    private String productName;
    private String businessName;
    private String city;
    private BigDecimal price;
    private Integer stockQuantity;
    private BigDecimal averageRating;
    private Long reviewCount;
    private String availabilityStatus;

    public ProductAvailabilityResponse() {
    }

    public ProductAvailabilityResponse(
            Integer productId,
            String productName,
            String businessName,
            String city,
            BigDecimal price,
            Integer stockQuantity,
            BigDecimal averageRating,
            Long reviewCount,
            String availabilityStatus) {

        this.productId = productId;
        this.productName = productName;
        this.businessName = businessName;
        this.city = city;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
        this.availabilityStatus = availabilityStatus;
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

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
}