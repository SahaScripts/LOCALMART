package com.localmarketplace.controller;

import com.localmarketplace.entity.Review;
import com.localmarketplace.Service.ReviewService;
import com.localmarketplace.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Get all reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    // Get review by ID
    @GetMapping("/{id}")
    public Review getReviewById(@PathVariable Integer id) {
        return reviewService.getReviewById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    // Create a new review
    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return reviewService.saveReview(review);
    }

    // Update review
    @PutMapping("/{id}")
    public Review updateReview(
            @PathVariable Integer id,
            @RequestBody Review reviewDetails) {

        Review review = reviewService.getReviewById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setOrder(reviewDetails.getOrder());
        review.setProduct(reviewDetails.getProduct());
        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());

        return reviewService.saveReview(review);
    }

    // Delete review
    @DeleteMapping("/{id}")
    public String deleteReview(@PathVariable Integer id) {

        reviewService.getReviewById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        reviewService.deleteReview(id);

        return "Review deleted successfully";
    }
}