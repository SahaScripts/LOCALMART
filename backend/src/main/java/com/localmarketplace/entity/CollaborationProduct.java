package com.localmarketplace.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "collaboration_products")
@IdClass(CollaborationProductId.class)
public class CollaborationProduct {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaboration_id", nullable = false)
    private Collaboration collaboration;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    public CollaborationProduct() {
    }

    public CollaborationProduct(Collaboration collaboration, Product product, Business business) {
        this.collaboration = collaboration;
        this.product = product;
        this.business = business;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Collaboration getCollaboration() {
        return collaboration;
    }

    public void setCollaboration(Collaboration collaboration) {
        this.collaboration = collaboration;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Business getBusiness() {
        return business;
    }

    public void setBusiness(Business business) {
        this.business = business;
    }
}
