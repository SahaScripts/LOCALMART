package com.localmarketplace.report;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductPerformanceReportService {

    private final ProductPerformanceReportRepository repository;

    public ProductPerformanceReportService(
            ProductPerformanceReportRepository repository) {
        this.repository = repository;
    }

    public List<ProductPerformanceReport> getProductPerformance() {

        return repository.findProductPerformance()
                .stream()
                .map(row -> new ProductPerformanceReport(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue(),
                        (BigDecimal) row[5]
                ))
                .toList();
    }
}