package com.localmarketplace.entity;

import java.io.Serializable;
import java.util.Objects;

public class CollaborationProductId implements Serializable {

    private Integer collaboration;
    private Integer product;

    public CollaborationProductId() {
    }

    public CollaborationProductId(Integer collaboration, Integer product) {
        this.collaboration = collaboration;
        this.product = product;
    }

    public Integer getCollaboration() {
        return collaboration;
    }

    public void setCollaboration(Integer collaboration) {
        this.collaboration = collaboration;
    }

    public Integer getProduct() {
        return product;
    }

    public void setProduct(Integer product) {
        this.product = product;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CollaborationProductId that = (CollaborationProductId) o;
        return Objects.equals(collaboration, that.collaboration) && Objects.equals(product, that.product);
    }

    @Override
    public int hashCode() {
        return Objects.hash(collaboration, product);
    }
}
