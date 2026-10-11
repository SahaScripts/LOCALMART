package com.localmarketplace.Service;

import com.localmarketplace.dto.InventoryRecommendationResponse;
import com.localmarketplace.repository.InventoryRecommendationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryRecommendationService {

    private final InventoryRecommendationRepository inventoryRecommendationRepository;

    public InventoryRecommendationService(
            InventoryRecommendationRepository inventoryRecommendationRepository) {

        this.inventoryRecommendationRepository = inventoryRecommendationRepository;
    }

    public List<InventoryRecommendationResponse> getRecommendationsByBusiness(
            Integer businessId) {

        return inventoryRecommendationRepository
                .getRecommendationsByBusiness(businessId);
    }
}