package com.localmarketplace.controller;

import com.localmarketplace.Service.OrderService;
import com.localmarketplace.dto.CheckoutWithFulfillmentRequest;
import com.localmarketplace.dto.OrderFulfillmentResponse;
import com.localmarketplace.entity.Order;
import com.localmarketplace.entity.User;
import com.localmarketplace.exception.ResourceNotFoundException;
import com.localmarketplace.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(
            OrderService orderService,
            UserRepository userRepository) {

        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Get order by ID
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));
    }

    // Get fulfillments for an order
    @GetMapping("/{id}/fulfillments")
    public List<OrderFulfillmentResponse> getOrderFulfillments(@PathVariable Integer id) {
        return orderService.getFulfillmentsForOrder(id);
    }

    // Create a new order
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.saveOrder(order);
    }

    // Place order from cart using PostgreSQL stored procedure (legacy fallback)
    @PostMapping("/place/{cartId}")
    public ResponseEntity<Map<String, Object>> placeOrder(
            @PathVariable Integer cartId) {

        Integer orderId = orderService.placeOrder(cartId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order placed successfully for cart ID: " + cartId);
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }

    // Place order with multi-business fulfillment choices
    @PostMapping("/place-with-fulfillment")
    public ResponseEntity<Map<String, Object>> placeOrderWithFulfillment(
            @RequestBody CheckoutWithFulfillmentRequest request) {

        Integer orderId = orderService.placeOrderWithFulfillments(
                request.getCartId(),
                request.getFulfillments()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order placed successfully with fulfillment preferences");
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }

    // Update order
    @PutMapping("/{id}")
    public Order updateOrder(
            @PathVariable Integer id,
            @RequestBody Order orderDetails) {

        Order order = orderService.getOrderById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));

        User user = userRepository.findById(
                orderDetails.getUser().getUserId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("User not found"));

        order.setUser(user);
        order.setOrderDate(orderDetails.getOrderDate());
        order.setOrderStatus(orderDetails.getOrderStatus());
        order.setShippingAddress(orderDetails.getShippingAddress());

        return orderService.saveOrder(order);
    }

    // Delete order
    @DeleteMapping("/{id}")
    public String deleteOrder(@PathVariable Integer id) {

        orderService.getOrderById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));

        orderService.deleteOrder(id);

        return "Order deleted successfully";
    }
}