package com.localmarketplace.report;

import java.math.BigDecimal;

public class ProductCatalogReport {

    private Integer productId;
    private String productName;
    private String businessName;
    private String categoryName;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;

    public ProductCatalogReport(
            Integer productId,
            String productName,
            String businessName,
            String categoryName,
            String description,
            BigDecimal price,
            Integer stockQuantity) {

        this.productId = productId;
        this.productName = productName;
        this.businessName = businessName;
        this.categoryName = categoryName;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
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

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }
}