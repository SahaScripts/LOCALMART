package com.localmarketplace.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class CustomerOrderSummaryReportController {

    private final CustomerOrderSummaryReportService service;

    public CustomerOrderSummaryReportController(
            CustomerOrderSummaryReportService service) {
        this.service = service;
    }

    @GetMapping("/customer-order-summary")
    public List<CustomerOrderSummaryReport> getCustomerOrderSummary() {
        return service.getCustomerOrderSummary();
    }
}