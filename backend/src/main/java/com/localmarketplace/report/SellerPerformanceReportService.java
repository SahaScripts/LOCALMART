package com.localmarketplace.report;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SellerPerformanceReportService {

    private final SellerPerformanceReportRepository repository;

    public SellerPerformanceReportService(
            SellerPerformanceReportRepository repository) {
        this.repository = repository;
    }

    public List<SellerPerformanceReport> getSellerPerformance() {

        return repository.findSellerPerformance()
                .stream()
                .map(row -> new SellerPerformanceReport(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue(),
                        (BigDecimal) row[4]
                ))
                .toList();
    }
}