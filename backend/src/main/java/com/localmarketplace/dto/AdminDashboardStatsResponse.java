package com.localmarketplace.dto;

import java.math.BigDecimal;

public class AdminDashboardStatsResponse {

    private long totalCustomers;
    private long totalSellers;
    private long totalBusinesses;
    private long pendingBusinesses;
    private long approvedBusinesses;
    private long totalProducts;
    private long hiddenProducts;
    private long totalOrders;
    private long totalReviews;
    private long hiddenReviews;
    private BigDecimal totalRevenue;

    private long totalCollaborations;
    private long pendingCollaborations;
    private long activeCollaborations;

    public AdminDashboardStatsResponse() {
    }

    public AdminDashboardStatsResponse(
            long totalCustomers,
            long totalSellers,
            long totalBusinesses,
            long pendingBusinesses,
            long approvedBusinesses,
            long totalProducts,
            long hiddenProducts,
            long totalOrders,
            long totalReviews,
            long hiddenReviews,
            BigDecimal totalRevenue,
            long totalCollaborations,
            long pendingCollaborations,
            long activeCollaborations
    ) {
        this.totalCustomers = totalCustomers;
        this.totalSellers = totalSellers;
        this.totalBusinesses = totalBusinesses;
        this.pendingBusinesses = pendingBusinesses;
        this.approvedBusinesses = approvedBusinesses;
        this.totalProducts = totalProducts;
        this.hiddenProducts = hiddenProducts;
        this.totalOrders = totalOrders;
        this.totalReviews = totalReviews;
        this.hiddenReviews = hiddenReviews;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        this.totalCollaborations = totalCollaborations;
        this.pendingCollaborations = pendingCollaborations;
        this.activeCollaborations = activeCollaborations;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalSellers() {
        return totalSellers;
    }

    public void setTotalSellers(long totalSellers) {
        this.totalSellers = totalSellers;
    }

    public long getTotalBusinesses() {
        return totalBusinesses;
    }

    public void setTotalBusinesses(long totalBusinesses) {
        this.totalBusinesses = totalBusinesses;
    }

    public long getPendingBusinesses() {
        return pendingBusinesses;
    }

    public void setPendingBusinesses(long pendingBusinesses) {
        this.pendingBusinesses = pendingBusinesses;
    }

    public long getApprovedBusinesses() {
        return approvedBusinesses;
    }

    public void setApprovedBusinesses(long approvedBusinesses) {
        this.approvedBusinesses = approvedBusinesses;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getHiddenProducts() {
        return hiddenProducts;
    }

    public void setHiddenProducts(long hiddenProducts) {
        this.hiddenProducts = hiddenProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public long getHiddenReviews() {
        return hiddenReviews;
    }

    public void setHiddenReviews(long hiddenReviews) {
        this.hiddenReviews = hiddenReviews;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalCollaborations() {
        return totalCollaborations;
    }

    public void setTotalCollaborations(long totalCollaborations) {
        this.totalCollaborations = totalCollaborations;
    }

    public long getPendingCollaborations() {
        return pendingCollaborations;
    }

    public void setPendingCollaborations(long pendingCollaborations) {
        this.pendingCollaborations = pendingCollaborations;
    }

    public long getActiveCollaborations() {
        return activeCollaborations;
    }

    public void setActiveCollaborations(long activeCollaborations) {
        this.activeCollaborations = activeCollaborations;
    }
}
