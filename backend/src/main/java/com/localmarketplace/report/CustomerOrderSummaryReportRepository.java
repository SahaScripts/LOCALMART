package com.localmarketplace.report;

import com.localmarketplace.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CustomerOrderSummaryReportRepository
        extends Repository<User, Integer> {

    @Query(value = """
        SELECT
            user_id,
            full_name,
            total_orders,
            items_purchased,
            total_spent
        FROM customer_order_summary
        ORDER BY total_spent DESC
        """, nativeQuery = true)
    List<Object[]> findCustomerOrderSummary();
}