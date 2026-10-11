package com.localmarketplace.controller;

import com.localmarketplace.entity.Cart;
import com.localmarketplace.Service.CartService;
import com.localmarketplace.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Get all carts
    @GetMapping
    public List<Cart> getAllCarts() {
        return cartService.getAllCarts();
    }

    // Get cart by ID
    @GetMapping("/{id}")
    public Cart getCartById(@PathVariable Integer id) {

        return cartService.getCartById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));
    }

    // Create a new cart
    @PostMapping
    public Cart createCart(@RequestBody Cart cart) {
        return cartService.saveCart(cart);
    }

    // Update an existing cart
    @PutMapping("/{id}")
    public Cart updateCart(
            @PathVariable Integer id,
            @RequestBody Cart cartDetails) {

        Cart cart = cartService.getCartById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        cart.setUser(cartDetails.getUser());

        return cartService.saveCart(cart);
    }

    // Delete a cart
    @DeleteMapping("/{id}")
    public String deleteCart(@PathVariable Integer id) {

        cartService.getCartById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        cartService.deleteCart(id);

        return "Cart deleted successfully";
    }
}