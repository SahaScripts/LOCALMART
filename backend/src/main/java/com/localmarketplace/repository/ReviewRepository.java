package com.localmarketplace.repository;

import com.localmarketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByReviewStatus(Review.ReviewStatus reviewStatus);

    List<Review> findByProduct_ProductIdAndReviewStatus(Integer productId, Review.ReviewStatus reviewStatus);

    long countByReviewStatus(Review.ReviewStatus reviewStatus);
}