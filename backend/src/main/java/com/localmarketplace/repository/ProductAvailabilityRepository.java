package com.localmarketplace.repository;

import com.localmarketplace.dto.ProductAvailabilityResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductAvailabilityRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProductAvailabilityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ProductAvailabilityResponse> searchAvailableProducts(
            String productName,
            String city) {

        String sql = """
                SELECT
                    product_id,
                    product_name,
                    business_name,
                    city,
                    price,
                    stock_quantity,
                    average_rating,
                    review_count,
                    availability_status
                FROM product_availability
                WHERE LOWER(product_name) LIKE LOWER(?)
                  AND LOWER(city) = LOWER(?)
                  AND stock_quantity > 0
                ORDER BY price ASC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new ProductAvailabilityResponse(
                        rs.getInt("product_id"),
                        rs.getString("product_name"),
                        rs.getString("business_name"),
                        rs.getString("city"),
                        rs.getBigDecimal("price"),
                        rs.getInt("stock_quantity"),
                        rs.getBigDecimal("average_rating"),
                        rs.getLong("review_count"),
                        rs.getString("availability_status")
                ),
                "%" + productName + "%",
                city
        );
    }
}