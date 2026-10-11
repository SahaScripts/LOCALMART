package com.localmarketplace.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ProductRatingsReportController {

    private final ProductRatingsReportService service;

    public ProductRatingsReportController(
            ProductRatingsReportService service) {
        this.service = service;
    }

    @GetMapping("/product-ratings")
    public List<ProductRatingsReport> getProductRatings() {
        return service.getProductRatings();
    }
}