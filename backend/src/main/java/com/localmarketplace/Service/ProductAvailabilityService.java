package com.localmarketplace.Service;

import com.localmarketplace.dto.ProductAvailabilityResponse;
import com.localmarketplace.repository.ProductAvailabilityRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductAvailabilityService {

    private final ProductAvailabilityRepository productAvailabilityRepository;

    public ProductAvailabilityService(
            ProductAvailabilityRepository productAvailabilityRepository) {

        this.productAvailabilityRepository = productAvailabilityRepository;
    }

    public List<ProductAvailabilityResponse> searchAvailableProducts(
            String productName,
            String city) {

        return productAvailabilityRepository.searchAvailableProducts(
                productName,
                city
        );
    }
}