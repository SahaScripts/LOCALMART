package com.localmarketplace.dto;

import java.math.BigDecimal;

public class AdminProductResponse {

    private Integer productId;
    private String productName;
    private Integer businessId;
    private String businessName;
    private Integer categoryId;
    private String categoryName;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String listingStatus;
    private Boolean isCollaborative;

    public AdminProductResponse() {
    }

    public AdminProductResponse(
            Integer productId,
            String productName,
            Integer businessId,
            String businessName,
            Integer categoryId,
            String categoryName,
            BigDecimal price,
            Integer stockQuantity,
            String listingStatus
    ) {
        this(productId, productName, businessId, businessName, categoryId, categoryName, null, price, stockQuantity, listingStatus);
    }

    public AdminProductResponse(
            Integer productId,
            String productName,
            Integer businessId,
            String businessName,
            Integer categoryId,
            String categoryName,
            String description,
            BigDecimal price,
            Integer stockQuantity,
            String listingStatus
    ) {
        this.productId = productId;
        this.productName = productName;
        this.businessId = businessId;
        this.businessName = businessName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.listingStatus = listingStatus;
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

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getListingStatus() {
        return listingStatus;
    }

    public void setListingStatus(String listingStatus) {
        this.listingStatus = listingStatus;
    }

    public Boolean getIsCollaborative() {
        return isCollaborative;
    }

    public void setIsCollaborative(Boolean isCollaborative) {
        this.isCollaborative = isCollaborative;
    }
}
