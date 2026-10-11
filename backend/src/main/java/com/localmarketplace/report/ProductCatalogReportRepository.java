package com.localmarketplace.report;

import com.localmarketplace.entity.Product;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface ProductCatalogReportRepository
        extends Repository<Product, Integer> {

    @Query(value = """
        SELECT
            product_id,
            product_name,
            business_name,
            category_name,
            description,
            price,
            stock_quantity
        FROM product_catalog
        ORDER BY product_name
        """, nativeQuery = true)
    List<Object[]> findAllProductCatalog();
}