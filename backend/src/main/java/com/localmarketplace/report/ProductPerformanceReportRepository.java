package com.localmarketplace.report;

import com.localmarketplace.entity.Product;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface ProductPerformanceReportRepository
        extends Repository<Product, Integer> {

    @Query(value = """
        SELECT
            product_id,
            product_name,
            business_name,
            category_name,
            units_sold,
            revenue
        FROM product_performance
        ORDER BY revenue DESC
        """, nativeQuery = true)
    List<Object[]> findProductPerformance();
}