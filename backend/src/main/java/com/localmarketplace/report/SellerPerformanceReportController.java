package com.localmarketplace.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class SellerPerformanceReportController {

    private final SellerPerformanceReportService service;

    public SellerPerformanceReportController(
            SellerPerformanceReportService service) {
        this.service = service;
    }

    @GetMapping("/seller-performance")
    public List<SellerPerformanceReport> getSellerPerformance() {
        return service.getSellerPerformance();
    }
}