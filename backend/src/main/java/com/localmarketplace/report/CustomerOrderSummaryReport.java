package com.localmarketplace.report;

import java.math.BigDecimal;

public class CustomerOrderSummaryReport {

    private Integer userId;
    private String fullName;
    private Long totalOrders;
    private Long itemsPurchased;
    private BigDecimal totalSpent;

    public CustomerOrderSummaryReport(
            Integer userId,
            String fullName,
            Long totalOrders,
            Long itemsPurchased,
            BigDecimal totalSpent) {

        this.userId = userId;
        this.fullName = fullName;
        this.totalOrders = totalOrders;
        this.itemsPurchased = itemsPurchased;
        this.totalSpent = totalSpent;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public Long getItemsPurchased() {
        return itemsPurchased;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }
}