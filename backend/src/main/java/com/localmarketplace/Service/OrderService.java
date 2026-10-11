package com.localmarketplace.Service;

import com.localmarketplace.dto.FulfillmentSelectionRequest;
import com.localmarketplace.dto.OrderFulfillmentResponse;
import com.localmarketplace.entity.Business;
import com.localmarketplace.entity.Order;
import com.localmarketplace.entity.OrderFulfillment;
import com.localmarketplace.repository.BusinessRepository;
import com.localmarketplace.repository.OrderFulfillmentRepository;
import com.localmarketplace.repository.OrderRepository;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderFulfillmentRepository fulfillmentRepository;
    private final BusinessRepository businessRepository;
    private final JdbcTemplate jdbcTemplate;

    public OrderService(
            OrderRepository orderRepository,
            OrderFulfillmentRepository fulfillmentRepository,
            BusinessRepository businessRepository,
            JdbcTemplate jdbcTemplate) {

        this.orderRepository = orderRepository;
        this.fulfillmentRepository = fulfillmentRepository;
        this.businessRepository = businessRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Integer id) {
        return orderRepository.findById(id);
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }

    @Transactional
    public Integer placeOrder(Integer cartId) {
        return placeOrderWithFulfillments(cartId, Collections.emptyList());
    }

    @Transactional
    public Integer placeOrderWithFulfillments(Integer cartId, List<FulfillmentSelectionRequest> selections) {
        // Pre-fetch user and businesses in cart before stored procedure clears it
        Integer userId;
        try {
            userId = jdbcTemplate.queryForObject(
                    "SELECT user_id FROM carts WHERE cart_id = ?",
                    Integer.class,
                    cartId
            );
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found: " + cartId);
        }

        List<Integer> businessIdsInCart = jdbcTemplate.queryForList(
                "SELECT DISTINCT p.business_id FROM cart_items ci JOIN products p ON ci.product_id = p.product_id WHERE ci.cart_id = ?",
                Integer.class,
                cartId
        );

        if (businessIdsInCart.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart " + cartId + " is empty.");
        }

        try {
            jdbcTemplate.update("CALL place_order(?)", cartId);
        } catch (DataAccessException ex) {
            String errorMessage = ex.getMostSpecificCause().getMessage();
            if (errorMessage != null && errorMessage.contains("Insufficient stock")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for cart " + cartId);
            }
            throw ex;
        }

        // Retrieve the newly created order for the user
        Integer orderId = jdbcTemplate.queryForObject(
                "SELECT order_id FROM orders WHERE user_id = ? ORDER BY order_id DESC LIMIT 1",
                Integer.class,
                userId
        );

        if (orderId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Order creation failed to return order ID");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created order not found"));

        // Build lookup map from submitted selections
        Map<Integer, FulfillmentSelectionRequest> selectionMap = new HashMap<>();
        if (selections != null) {
            for (FulfillmentSelectionRequest req : selections) {
                if (req.getBusinessId() != null) {
                    selectionMap.put(req.getBusinessId(), req);
                }
            }
        }

        // Create OrderFulfillment entries for each distinct business involved
        for (Integer businessId : businessIdsInCart) {
            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) continue;

            FulfillmentSelectionRequest sel = selectionMap.get(businessId);
            OrderFulfillment.DeliveryMethod method = OrderFulfillment.DeliveryMethod.SELLER_DELIVERY;
            String pickupLocation = business.getAddress() + ", " + business.getCity() + ", " + business.getPostalCode();
            String deliveryAddress = order.getShippingAddress();

            if (sel != null && sel.getDeliveryMethod() != null) {
                if ("SELF_PICKUP".equalsIgnoreCase(sel.getDeliveryMethod())) {
                    method = OrderFulfillment.DeliveryMethod.SELF_PICKUP;
                    if (sel.getPickupLocation() != null && !sel.getPickupLocation().isBlank()) {
                        pickupLocation = sel.getPickupLocation();
                    }
                } else {
                    method = OrderFulfillment.DeliveryMethod.SELLER_DELIVERY;
                    if (sel.getDeliveryAddress() != null && !sel.getDeliveryAddress().isBlank()) {
                        deliveryAddress = sel.getDeliveryAddress();
                    }
                }
            }

            OrderFulfillment fulfillment = new OrderFulfillment(
                    order,
                    business,
                    method,
                    pickupLocation,
                    deliveryAddress,
                    "PENDING"
            );
            fulfillmentRepository.save(fulfillment);
        }

        return orderId;
    }

    public List<OrderFulfillmentResponse> getFulfillmentsForOrder(Integer orderId) {
        return fulfillmentRepository.findByOrder_OrderId(orderId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<OrderFulfillmentResponse> getFulfillmentsForBusiness(Integer businessId) {
        return fulfillmentRepository.findByBusiness_BusinessId(businessId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    private OrderFulfillmentResponse toResponseDto(OrderFulfillment f) {
        OrderFulfillmentResponse res = new OrderFulfillmentResponse();
        res.setFulfillmentId(f.getFulfillmentId());
        res.setOrderId(f.getOrder().getOrderId());
        if (f.getBusiness() != null) {
            res.setBusinessId(f.getBusiness().getBusinessId());
            res.setBusinessName(f.getBusiness().getBusinessName());
            res.setBusinessAddress(f.getBusiness().getAddress() + ", " + f.getBusiness().getCity());
            res.setBusinessPhone(f.getBusiness().getPhone());
        }
        res.setDeliveryMethod(f.getDeliveryMethod().name());
        res.setPickupLocation(f.getPickupLocation());
        res.setDeliveryAddress(f.getDeliveryAddress());
        res.setStatus(f.getStatus());
        res.setCreatedAt(f.getCreatedAt());
        return res;
    }
}