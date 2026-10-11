
package com.localmarketplace.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "reviews",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_reviews_order_product",
            columnNames = {"order_id", "product_id"}
        )
    }
)
public class Review {

    public enum ReviewStatus {
        ACTIVE,
        HIDDEN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", nullable = false)
    private ReviewStatus reviewStatus = ReviewStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "review_date", nullable = false, updatable = false)
    private LocalDateTime reviewDate = LocalDateTime.now();

    // Default constructor
    public Review() {
    }

    // Constructor
    public Review(Order order, Product product, Integer rating, String comment) {
        this.order = order;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
        this.reviewDate = LocalDateTime.now();
    }

    // Getter
    public Integer getReviewId() {
        return reviewId;
    }

    // Setter
    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    // Getter
    public Order getOrder() {
        return order;
    }

    // Setter
    public void setOrder(Order order) {
        this.order = order;
    }

    // Getter
    public Product getProduct() {
        return product;
    }

    // Setter
    public void setProduct(Product product) {
        this.product = product;
    }

    // Getter
    public Integer getRating() {
        return rating;
    }

    // Setter
    public void setRating(Integer rating) {
        this.rating = rating;
    }

    // Getter
    public String getComment() {
        return comment;
    }

    // Setter
    public void setComment(String comment) {
        this.comment = comment;
    }

    // Getter
    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    // Setter
    public void setReviewDate(LocalDateTime reviewDate) {
        this.reviewDate = reviewDate;
    }
}