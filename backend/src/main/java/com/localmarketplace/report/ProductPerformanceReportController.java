package com.localmarketplace.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ProductPerformanceReportController {

    private final ProductPerformanceReportService service;

    public ProductPerformanceReportController(
            ProductPerformanceReportService service) {
        this.service = service;
    }

    @GetMapping("/product-performance")
    public List<ProductPerformanceReport> getProductPerformance() {
        return service.getProductPerformance();
    }
}