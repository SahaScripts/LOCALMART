package com.localmarketplace.entity;

import java.io.Serializable;
import java.util.Objects;

public class CartItemId implements Serializable {

    private Integer cart;
    private Integer product;

    public CartItemId() {
    }

    public CartItemId(Integer cart, Integer product) {
        this.cart = cart;
        this.product = product;
    }

    public Integer getCart() {
        return cart;
    }

    public void setCart(Integer cart) {
        this.cart = cart;
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

        CartItemId that = (CartItemId) o;

        return Objects.equals(cart, that.cart)
                && Objects.equals(product, that.product);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cart, product);
    }
}