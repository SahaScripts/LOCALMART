package com.localmarketplace.report;

import java.math.BigDecimal;

public class SellerPerformanceReport {

    private Integer businessId;
    private String businessName;
    private Long totalOrders;
    private Long itemsSold;
    private BigDecimal totalRevenue;

    public SellerPerformanceReport(
            Integer businessId,
            String businessName,
            Long totalOrders,
            Long itemsSold,
            BigDecimal totalRevenue) {

        this.businessId = businessId;
        this.businessName = businessName;
        this.totalOrders = totalOrders;
        this.itemsSold = itemsSold;
        this.totalRevenue = totalRevenue;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public Long getItemsSold() {
        return itemsSold;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
}