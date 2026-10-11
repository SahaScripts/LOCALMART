package com.localmarketplace.controller;

import com.localmarketplace.Service.InventoryRecommendationService;
import com.localmarketplace.dto.InventoryRecommendationResponse;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryRecommendationController {

    private final InventoryRecommendationService inventoryRecommendationService;

    public InventoryRecommendationController(
            InventoryRecommendationService inventoryRecommendationService) {

        this.inventoryRecommendationService = inventoryRecommendationService;
    }

    @GetMapping("/recommendations/business/{businessId}")
    public List<InventoryRecommendationResponse> getRecommendationsByBusiness(
            @PathVariable Integer businessId) {

        return inventoryRecommendationService
                .getRecommendationsByBusiness(businessId);
    }
}