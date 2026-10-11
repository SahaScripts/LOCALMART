package com.localmarketplace.dto;

import java.math.BigDecimal;
import java.util.List;

public class CollaborativeProductCreateRequest {

    private Integer collaborationId;
    private Integer categoryId;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private List<Integer> linkedBusinessIds;

    public CollaborativeProductCreateRequest() {
    }

    public Integer getCollaborationId() {
        return collaborationId;
    }

    public void setCollaborationId(Integer collaborationId) {
        this.collaborationId = collaborationId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
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

    public List<Integer> getLinkedBusinessIds() {
        return linkedBusinessIds;
    }

    public void setLinkedBusinessIds(List<Integer> linkedBusinessIds) {
        this.linkedBusinessIds = linkedBusinessIds;
    }
}
