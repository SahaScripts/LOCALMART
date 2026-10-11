package com.localmarketplace.entity;

import java.io.Serializable;
import java.util.Objects;

public class OrderItemId implements Serializable {

    private Integer order;
    private Integer product;

    public OrderItemId() {
    }

    public OrderItemId(Integer order, Integer product) {
        this.order = order;
        this.product = product;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof OrderItemId)) {
            return false;
        }

        OrderItemId that = (OrderItemId) o;

        return Objects.equals(order, that.order)
                && Objects.equals(product, that.product);
    }

    @Override
    public int hashCode() {
        return Objects.hash(order, product);
    }
}