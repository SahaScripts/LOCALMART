package com.localmarketplace.dto;

import java.time.LocalDateTime;

public class AdminReviewResponse {

    private Integer reviewId;
    private Integer orderId;
    private Integer productId;
    private String productName;
    private String customerName;
    private Integer rating;
    private String comment;
    private String reviewStatus;
    private LocalDateTime reviewDate;

    public AdminReviewResponse() {
    }

    public AdminReviewResponse(
            Integer reviewId,
            Integer orderId,
            Integer productId,
            String productName,
            String customerName,
            Integer rating,
            String comment,
            String reviewStatus,
            LocalDateTime reviewDate
    ) {
        this.reviewId = reviewId;
        this.orderId = orderId;
        this.productId = productId;
        this.productName = productName;
        this.customerName = customerName;
        this.rating = rating;
        this.comment = comment;
        this.reviewStatus = reviewStatus;
        this.reviewDate = reviewDate;
    }

    public Integer getReviewId() {
        return reviewId;
    }

    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDateTime reviewDate) {
        this.reviewDate = reviewDate;
    }
}
