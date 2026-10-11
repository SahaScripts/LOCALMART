package com.localmarketplace.controller;

import com.localmarketplace.Service.CartItemService;
import com.localmarketplace.entity.CartItem;
import com.localmarketplace.entity.CartItemId;
import com.localmarketplace.entity.Cart;
import com.localmarketplace.entity.Product;
import com.localmarketplace.exception.ResourceNotFoundException;
import com.localmarketplace.repository.CartRepository;
import com.localmarketplace.repository.ProductRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
public class CartItemController {

    private final CartItemService cartItemService;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartItemController(
            CartItemService cartItemService,
            CartRepository cartRepository,
            ProductRepository productRepository) {

        this.cartItemService = cartItemService;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    // Get all cart items
    @GetMapping
    public List<CartItem> getAllCartItems() {
        return cartItemService.getAllCartItems();
    }

    // Get all items belonging to a specific cart
    @GetMapping("/cart/{cartId}")
    public List<CartItem> getCartItemsByCartId(
            @PathVariable Integer cartId) {

        return cartItemService.getCartItemsByCartId(cartId);
    }

    // Get one specific cart item
    @GetMapping("/{cartId}/{productId}")
    public CartItem getCartItemById(
            @PathVariable Integer cartId,
            @PathVariable Integer productId) {

        CartItemId id = new CartItemId(cartId, productId);

        return cartItemService.getCartItemById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));
    }

    // Add a product to a cart
    @PostMapping
    public CartItem createCartItem(@RequestBody CartItemRequest request) {

        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        CartItem cartItem = new CartItem(
                cart,
                product,
                request.getQuantity()
        );

        return cartItemService.saveCartItem(cartItem);
    }

    // Update quantity of a product in a cart
    @PutMapping("/{cartId}/{productId}")
    public CartItem updateCartItem(
            @PathVariable Integer cartId,
            @PathVariable Integer productId,
            @RequestBody CartItemRequest request) {

        CartItemId id = new CartItemId(cartId, productId);

        CartItem cartItem = cartItemService.getCartItemById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));

        cartItem.setQuantity(request.getQuantity());

        return cartItemService.saveCartItem(cartItem);
    }

    // Remove a product from a cart
    @DeleteMapping("/{cartId}/{productId}")
    public String deleteCartItem(
            @PathVariable Integer cartId,
            @PathVariable Integer productId) {

        CartItemId id = new CartItemId(cartId, productId);

        cartItemService.getCartItemById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));

        cartItemService.deleteCartItem(id);

        return "Cart item deleted successfully";
    }

    // Request body used for POST and PUT
    public static class CartItemRequest {

        private Integer cartId;
        private Integer productId;
        private Integer quantity;

        public Integer getCartId() {
            return cartId;
        }

        public void setCartId(Integer cartId) {
            this.cartId = cartId;
        }

        public Integer getProductId() {
            return productId;
        }

        public void setProductId(Integer productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}