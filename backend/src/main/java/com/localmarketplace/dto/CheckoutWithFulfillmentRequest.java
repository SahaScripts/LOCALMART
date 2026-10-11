package com.localmarketplace.dto;

import java.util.List;

public class CheckoutWithFulfillmentRequest {

    private Integer cartId;
    private List<FulfillmentSelectionRequest> fulfillments;

    public CheckoutWithFulfillmentRequest() {
    }

    public CheckoutWithFulfillmentRequest(Integer cartId, List<FulfillmentSelectionRequest> fulfillments) {
        this.cartId = cartId;
        this.fulfillments = fulfillments;
    }

    public Integer getCartId() {
        return cartId;
    }

    public void setCartId(Integer cartId) {
        this.cartId = cartId;
    }

    public List<FulfillmentSelectionRequest> getFulfillments() {
        return fulfillments;
    }

    public void setFulfillments(List<FulfillmentSelectionRequest> fulfillments) {
        this.fulfillments = fulfillments;
    }
}
