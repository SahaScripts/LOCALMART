package com.localmarketplace.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "order_status", nullable = false)
    private String orderStatus;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    // Default constructor
    public Order() {
    }

    // Constructor
    public Order(User user, LocalDateTime orderDate, String orderStatus,
                 String shippingAddress) {
        this.user = user;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
        this.shippingAddress = shippingAddress;
    }

    // Getter
    public Integer getOrderId() {
        return orderId;
    }

    // Setter
    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    // Getter
    public User getUser() {
        return user;
    }

    // Setter
    public void setUser(User user) {
        this.user = user;
    }

    // Getter
    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    // Setter
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    // Getter
    public String getOrderStatus() {
        return orderStatus;
    }

    // Setter
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    // Getter
    public String getShippingAddress() {
        return shippingAddress;
    }

    // Setter
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}