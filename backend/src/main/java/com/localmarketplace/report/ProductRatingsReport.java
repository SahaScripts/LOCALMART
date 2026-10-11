package com.localmarketplace.report;

import java.math.BigDecimal;

public class ProductRatingsReport {

    private Integer productId;
    private String productName;
    private String businessName;
    private BigDecimal averageRating;
    private Long reviewCount;

    public ProductRatingsReport(
            Integer productId,
            String productName,
            String businessName,
            BigDecimal averageRating,
            Long reviewCount) {

        this.productId = productId;
        this.productName = productName;
        this.businessName = businessName;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public Integer getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getBusinessName() {
        return businessName;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public Long getReviewCount() {
        return reviewCount;
    }
}