package com.localmarketplace.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ProductCatalogReportController {

    private final ProductCatalogReportService service;

    public ProductCatalogReportController(ProductCatalogReportService service) {
        this.service = service;
    }

    @GetMapping("/product-catalog")
    public List<ProductCatalogReport> getProductCatalog() {
        return service.getProductCatalog();
    }
}