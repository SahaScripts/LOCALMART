package com.localmarketplace.repository;

import com.localmarketplace.dto.InventoryRecommendationResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class InventoryRecommendationRepository {

    private final JdbcTemplate jdbcTemplate;

    public InventoryRecommendationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<InventoryRecommendationResponse> getRecommendationsByBusiness(
            Integer businessId) {

        String sql = """
                SELECT
                    product_id,
                    product_name,
                    business_id,
                    business_name,
                    current_stock,
                    units_ordered_60d,
                    avg_daily_demand,
                    estimated_days_remaining,
                    inventory_status,
                    suggested_reorder_quantity,
                    recommendation
                FROM inventory_restock_recommendations
                WHERE business_id = ?
                ORDER BY
                    CASE recommendation
                        WHEN 'RESTOCK_IMMEDIATELY' THEN 1
                        WHEN 'RESTOCK_HIGH_PRIORITY' THEN 2
                        WHEN 'RESTOCK_RECOMMENDED' THEN 3
                        WHEN 'NO_RESTOCK_NEEDED' THEN 4
                        WHEN 'NO_RECENT_DEMAND' THEN 5
                        ELSE 6
                    END,
                    product_name
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new InventoryRecommendationResponse(
                        rs.getInt("product_id"),
                        rs.getString("product_name"),
                        rs.getInt("business_id"),
                        rs.getString("business_name"),
                        rs.getInt("current_stock"),
                        rs.getLong("units_ordered_60d"),
                        rs.getBigDecimal("avg_daily_demand"),
                        rs.getBigDecimal("estimated_days_remaining"),
                        rs.getString("inventory_status"),
                        rs.getInt("suggested_reorder_quantity"),
                        rs.getString("recommendation")
                ),
                businessId
        );
    }
}