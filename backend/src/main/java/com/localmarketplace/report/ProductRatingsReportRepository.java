package com.localmarketplace.report;

import com.localmarketplace.entity.Product;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface ProductRatingsReportRepository
        extends Repository<Product, Integer> {

    @Query(value = """
        SELECT
            product_id,
            product_name,
            business_name,
            average_rating,
            review_count
        FROM product_ratings
        ORDER BY average_rating DESC, review_count DESC
        """, nativeQuery = true)
    List<Object[]> findProductRatings();
}