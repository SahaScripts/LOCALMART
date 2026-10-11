package com.localmarketplace.report;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomerOrderSummaryReportService {

    private final CustomerOrderSummaryReportRepository repository;

    public CustomerOrderSummaryReportService(
            CustomerOrderSummaryReportRepository repository) {
        this.repository = repository;
    }

    public List<CustomerOrderSummaryReport> getCustomerOrderSummary() {

        return repository.findCustomerOrderSummary()
                .stream()
                .map(row -> new CustomerOrderSummaryReport(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue(),
                        (BigDecimal) row[4]
                ))
                .toList();
    }
}