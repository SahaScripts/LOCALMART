package com.localmarketplace.report;

import java.math.BigDecimal;

public class ProductPerformanceReport {

    private Integer productId;
    private String productName;
    private String businessName;
    private String categoryName;
    private Long unitsSold;
    private BigDecimal revenue;

    public ProductPerformanceReport(
            Integer productId,
            String productName,
            String businessName,
            String categoryName,
            Long unitsSold,
            BigDecimal revenue) {

        this.productId = productId;
        this.productName = productName;
        this.businessName = businessName;
        this.categoryName = categoryName;
        this.unitsSold = unitsSold;
        this.revenue = revenue;
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

    public String getCategoryName() {
        return categoryName;
    }

    public Long getUnitsSold() {
        return unitsSold;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }
}