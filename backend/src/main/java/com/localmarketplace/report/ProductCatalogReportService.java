package com.localmarketplace.report;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductCatalogReportService {

    private final ProductCatalogReportRepository repository;

    public ProductCatalogReportService(ProductCatalogReportRepository repository) {
        this.repository = repository;
    }

    public List<ProductCatalogReport> getProductCatalog() {

        return repository.findAllProductCatalog()
                .stream()
                .map(row -> new ProductCatalogReport(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (String) row[4],
                        (BigDecimal) row[5],
                        ((Number) row[6]).intValue()
                ))
                .toList();
    }
}