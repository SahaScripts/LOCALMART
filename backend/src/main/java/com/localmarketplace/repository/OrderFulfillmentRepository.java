package com.localmarketplace.repository;

import com.localmarketplace.entity.OrderFulfillment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderFulfillmentRepository extends JpaRepository<OrderFulfillment, Integer> {

    List<OrderFulfillment> findByOrder_OrderId(Integer orderId);

    List<OrderFulfillment> findByBusiness_BusinessId(Integer businessId);
}
