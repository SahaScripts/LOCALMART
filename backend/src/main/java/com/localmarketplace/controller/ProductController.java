package com.localmarketplace.controller;

import com.localmarketplace.dto.ProductRequest;
import com.localmarketplace.entity.Business;
import com.localmarketplace.entity.Category;
import com.localmarketplace.entity.Product;
import com.localmarketplace.exception.ResourceNotFoundException;
import com.localmarketplace.repository.BusinessRepository;
import com.localmarketplace.repository.CategoryRepository;
import com.localmarketplace.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final CategoryRepository categoryRepository;

    public ProductController(
            ProductRepository productRepository,
            BusinessRepository businessRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.businessRepository = businessRepository;
        this.categoryRepository = categoryRepository;
    }

    // Get all products (Active products from Approved businesses)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findByListingStatusAndBusiness_VerificationStatus(
                Product.ListingStatus.ACTIVE,
                com.localmarketplace.entity.Business.VerificationStatus.APPROVED
        );
    }

    // Get product by ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    // Create a new product (Enforces Business Verification)
    @PostMapping
    public Product createProduct(@RequestBody ProductRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));

        if (business.getVerificationStatus() != Business.VerificationStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Business verification is required before listing products. Your current status is: " + business.getVerificationStatus()
            );
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        Product product = new Product(
                business,
                category,
                request.getProductName(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity()
        );

        return productRepository.save(product);
    }

    // Update an existing product (Enforces Business Verification)
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Integer id,
            @RequestBody ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));

        if (business.getVerificationStatus() != Business.VerificationStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Business verification is required before listing products. Your current status is: " + business.getVerificationStatus()
            );
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        product.setBusiness(business);
        product.setCategory(category);
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());

        return productRepository.save(product);
    }

    // Delete a product
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        productRepository.delete(product);
        return "Product deleted successfully";
    }
}