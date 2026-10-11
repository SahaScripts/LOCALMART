package com.localmarketplace.report;

import com.localmarketplace.entity.Business;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface SellerPerformanceReportRepository
        extends Repository<Business, Integer> {

    @Query(value = """
        SELECT
            business_id,
            business_name,
            total_orders,
            items_sold,
            total_revenue
        FROM seller_performance
        ORDER BY total_revenue DESC
        """, nativeQuery = true)
    List<Object[]> findSellerPerformance();
}