package com.localmarketplace.controller;

import com.localmarketplace.Service.ProductAvailabilityService;
import com.localmarketplace.dto.ProductAvailabilityResponse;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class ProductAvailabilityController {

    private final ProductAvailabilityService productAvailabilityService;

    public ProductAvailabilityController(
            ProductAvailabilityService productAvailabilityService) {

        this.productAvailabilityService = productAvailabilityService;
    }

    @GetMapping("/products")
    public List<ProductAvailabilityResponse> searchProducts(
            @RequestParam String name,
            @RequestParam String city) {

        return productAvailabilityService.searchAvailableProducts(
                name,
                city
        );
    }
}