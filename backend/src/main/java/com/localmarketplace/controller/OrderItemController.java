
package com.localmarketplace.controller;

import com.localmarketplace.Service.OrderItemService;
import com.localmarketplace.entity.Order;
import com.localmarketplace.entity.OrderItem;
import com.localmarketplace.entity.OrderItemId;
import com.localmarketplace.entity.Product;
import com.localmarketplace.exception.ResourceNotFoundException;
import com.localmarketplace.repository.OrderRepository;
import com.localmarketplace.repository.ProductRepository;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderItemController(
            OrderItemService orderItemService,
            OrderRepository orderRepository,
            ProductRepository productRepository) {

        this.orderItemService = orderItemService;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<OrderItem> getAllOrderItems() {
        return orderItemService.getAllOrderItems();
    }

    @GetMapping("/{orderId}/{productId}")
    public OrderItem getOrderItemById(
            @PathVariable Integer orderId,
            @PathVariable Integer productId) {

        OrderItemId id = new OrderItemId(orderId, productId);

        return orderItemService.getOrderItemById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order item not found"));
    }

    @PostMapping
    public OrderItem createOrderItem(@RequestBody OrderItemRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        OrderItem orderItem = new OrderItem(
                order,
                product,
                request.getQuantity(),
                request.getUnitPrice()
        );

        return orderItemService.saveOrderItem(orderItem);
    }

    @PutMapping("/{orderId}/{productId}")
    public OrderItem updateOrderItem(
            @PathVariable Integer orderId,
            @PathVariable Integer productId,
            @RequestBody OrderItemRequest request) {

        OrderItemId id = new OrderItemId(orderId, productId);

        OrderItem orderItem = orderItemService.getOrderItemById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order item not found"));

        orderItem.setQuantity(request.getQuantity());
        orderItem.setUnitPrice(request.getUnitPrice());

        return orderItemService.saveOrderItem(orderItem);
    }

    @DeleteMapping("/{orderId}/{productId}")
    public String deleteOrderItem(
            @PathVariable Integer orderId,
            @PathVariable Integer productId) {

        OrderItemId id = new OrderItemId(orderId, productId);

        orderItemService.getOrderItemById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order item not found"));

        orderItemService.deleteOrderItem(id);

        return "Order item deleted successfully";
    }

    public static class OrderItemRequest {

        private Integer orderId;
        private Integer productId;
        private Integer quantity;
        private BigDecimal unitPrice;

        public Integer getOrderId() {
            return orderId;
        }

        public void setOrderId(Integer orderId) {
            this.orderId = orderId;
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

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}