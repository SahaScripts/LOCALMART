package com.localmarketplace.controller;

import com.localmarketplace.Service.AdminService;
import com.localmarketplace.dto.*;
import com.localmarketplace.entity.Category;
import com.localmarketplace.entity.ServiceArea;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1. Dashboard
    @GetMapping("/dashboard")
    public AdminDashboardStatsResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    // 2. Users
    @GetMapping("/users")
    public List<AdminUserResponse> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        return adminService.getUsers(role, status, search);
    }

    @PatchMapping("/users/{userId}/status")
    public AdminUserResponse updateUserStatus(
            @PathVariable Integer userId,
            @RequestBody StatusUpdateRequest request
    ) {
        return adminService.updateUserStatus(userId, request);
    }

    // 3. Businesses & Verification
    @GetMapping("/businesses")
    public List<AdminBusinessResponse> getBusinesses(
            @RequestParam(required = false) String status
    ) {
        return adminService.getBusinesses(status);
    }

    @PatchMapping("/businesses/{businessId}/verification")
    public AdminBusinessResponse updateBusinessVerification(
            @PathVariable Integer businessId,
            @RequestBody StatusUpdateRequest request
    ) {
        return adminService.updateBusinessVerification(businessId, request);
    }

    // 4. Categories
    @GetMapping("/categories")
    public List<Category> getCategories() {
        return adminService.getCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public Category createCategory(@RequestBody Category category) {
        return adminService.createCategory(category);
    }

    @PutMapping("/categories/{categoryId}")
    public Category updateCategory(
            @PathVariable Integer categoryId,
            @RequestBody Category category
    ) {
        return adminService.updateCategory(categoryId, category);
    }

    @DeleteMapping("/categories/{categoryId}")
    public Map<String, String> deleteCategory(@PathVariable Integer categoryId) {
        adminService.deleteCategory(categoryId);
        return Map.of("message", "Category deleted successfully");
    }

    // 5. Products Moderation
    @GetMapping("/products")
    public List<AdminProductResponse> getProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        return adminService.getProducts(status, search);
    }

    @PatchMapping("/products/{productId}/status")
    public AdminProductResponse updateProductStatus(
            @PathVariable Integer productId,
            @RequestBody StatusUpdateRequest request
    ) {
        return adminService.updateProductStatus(productId, request);
    }

    // 6. Reviews Moderation
    @GetMapping("/reviews")
    public List<AdminReviewResponse> getReviews(
            @RequestParam(required = false) String status
    ) {
        return adminService.getReviews(status);
    }

    @PatchMapping("/reviews/{reviewId}/status")
    public AdminReviewResponse updateReviewStatus(
            @PathVariable Integer reviewId,
            @RequestBody StatusUpdateRequest request
    ) {
        return adminService.updateReviewStatus(reviewId, request);
    }

    // 7. Audit Logs
    @GetMapping("/audit-logs")
    public List<AdminAuditLogResponse> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType
    ) {
        return adminService.getAuditLogs(action, entityType);
    }

    // 8. Service Areas
    @GetMapping("/service-areas")
    public List<ServiceArea> getServiceAreas() {
        return adminService.getServiceAreas();
    }

    @PostMapping("/service-areas")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceArea createServiceArea(@RequestBody ServiceArea area) {
        return adminService.createServiceArea(area);
    }

    @PutMapping("/service-areas/{areaId}")
    public ServiceArea updateServiceArea(
            @PathVariable Integer areaId,
            @RequestBody ServiceArea area
    ) {
        return adminService.updateServiceArea(areaId, area);
    }

    // 9. Collaborations Governance
    @GetMapping("/collaborations")
    public List<CollaborationResponse> getCollaborations(
            @RequestParam(required = false) String status
    ) {
        return adminService.getCollaborations(status);
    }

    @PatchMapping("/collaborations/{collaborationId}/status")
    public CollaborationResponse updateCollaborationStatus(
            @PathVariable Integer collaborationId,
            @RequestBody StatusUpdateRequest request
    ) {
        return adminService.updateCollaborationStatus(collaborationId, request);
    }
}
