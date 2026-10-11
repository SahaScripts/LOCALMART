package com.localmarketplace.repository;

import com.localmarketplace.entity.Business;
import com.localmarketplace.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    boolean existsByCategory_CategoryId(Integer categoryId);

    List<Product> findByListingStatus(Product.ListingStatus listingStatus);

    List<Product> findByListingStatusAndBusiness_VerificationStatus(
            Product.ListingStatus listingStatus,
            Business.VerificationStatus verificationStatus
    );

    long countByListingStatus(Product.ListingStatus listingStatus);
}