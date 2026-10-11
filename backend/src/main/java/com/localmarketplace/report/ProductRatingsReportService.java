package com.localmarketplace.report;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ProductRatingsReportService {

    private final ProductRatingsReportRepository repository;

    public ProductRatingsReportService(
            ProductRatingsReportRepository repository) {
        this.repository = repository;
    }

    public List<ProductRatingsReport> getProductRatings() {

        return repository.findProductRatings()
                .stream()
                .map(row -> new ProductRatingsReport(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        (String) row[2],
                        ((BigDecimal) row[3]).setScale(2, RoundingMode.HALF_UP),
                        ((Number) row[4]).longValue()
                ))
                .toList();
    }
}