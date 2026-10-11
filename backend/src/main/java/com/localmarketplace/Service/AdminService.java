package com.localmarketplace.Service;

import com.localmarketplace.dto.*;
import com.localmarketplace.entity.*;
import com.localmarketplace.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final CollaborationRepository collaborationRepository;
    private final CollaborationService collaborationService;

    public AdminService(
            UserRepository userRepository,
            BusinessRepository businessRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ReviewRepository reviewRepository,
            AdminAuditLogRepository auditLogRepository,
            ServiceAreaRepository serviceAreaRepository,
            CollaborationRepository collaborationRepository,
            CollaborationService collaborationService
    ) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
        this.auditLogRepository = auditLogRepository;
        this.serviceAreaRepository = serviceAreaRepository;
        this.collaborationRepository = collaborationRepository;
        this.collaborationService = collaborationService;
    }

    private User getSystemAdmin() {
        return userRepository.findByRole(User.Role.ADMIN)
                .stream()
                .findFirst()
                .orElseGet(() -> userRepository.findById(5)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No Admin account found in database")));
    }

    // 1. Dashboard
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);
        long totalSellers = userRepository.countByRole(User.Role.SELLER);
        long totalBusinesses = businessRepository.count();
        long pendingBusinesses = businessRepository.countByVerificationStatus(Business.VerificationStatus.PENDING);
        long approvedBusinesses = businessRepository.countByVerificationStatus(Business.VerificationStatus.APPROVED);
        long totalProducts = productRepository.count();
        long hiddenProducts = productRepository.countByListingStatus(Product.ListingStatus.HIDDEN);
        long totalOrders = orderRepository.count();
        long totalReviews = reviewRepository.count();
        long hiddenReviews = reviewRepository.countByReviewStatus(Review.ReviewStatus.HIDDEN);
        var totalRevenue = orderItemRepository.calculateTotalPlatformRevenue();

        long totalCollaborations = collaborationRepository.count();
        long pendingCollaborations = collaborationRepository.countByStatus(Collaboration.Status.PENDING);
        long activeCollaborations = collaborationRepository.countByStatus(Collaboration.Status.ACCEPTED);

        return new AdminDashboardStatsResponse(
                totalCustomers,
                totalSellers,
                totalBusinesses,
                pendingBusinesses,
                approvedBusinesses,
                totalProducts,
                hiddenProducts,
                totalOrders,
                totalReviews,
                hiddenReviews,
                totalRevenue,
                totalCollaborations,
                pendingCollaborations,
                activeCollaborations
        );
    }

    // 2. Users
    public List<AdminUserResponse> getUsers(String roleStr, String statusStr, String search) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> {
                    if (roleStr != null && !roleStr.isBlank()) {
                        try {
                            User.Role r = User.Role.valueOf(roleStr.toUpperCase());
                            if (u.getRole() != r) return false;
                        } catch (IllegalArgumentException ignored) {}
                    }
                    if (statusStr != null && !statusStr.isBlank()) {
                        try {
                            User.AccountStatus s = User.AccountStatus.valueOf(statusStr.toUpperCase());
                            if (u.getAccountStatus() != s) return false;
                        } catch (IllegalArgumentException ignored) {}
                    }
                    if (search != null && !search.isBlank()) {
                        String query = search.toLowerCase();
                        boolean nameMatch = u.getFullName() != null && u.getFullName().toLowerCase().contains(query);
                        boolean emailMatch = u.getEmail() != null && u.getEmail().toLowerCase().contains(query);
                        if (!nameMatch && !emailMatch) return false;
                    }
                    return true;
                })
                .map(u -> new AdminUserResponse(
                        u.getUserId(),
                        u.getEmail(),
                        u.getFullName(),
                        u.getPhone(),
                        u.getAddress(),
                        u.getRole().name(),
                        u.getAccountStatus().name(),
                        u.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse updateUserStatus(Integer userId, StatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin account cannot be suspended");
        }

        User.AccountStatus newStatus;
        try {
            newStatus = User.AccountStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid account status: " + request.getStatus());
        }

        user.setAccountStatus(newStatus);
        userRepository.save(user);

        String action = newStatus == User.AccountStatus.SUSPENDED ? "SUSPEND_USER" : "REACTIVATE_USER";
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                action,
                "USER",
                userId,
                request.getReason() != null ? request.getReason() : "Account status updated to " + newStatus
        ));

        return new AdminUserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAddress(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                user.getCreatedAt()
        );
    }

    // 3. Businesses
    public List<AdminBusinessResponse> getBusinesses(String statusStr) {
        List<Business> list;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                Business.VerificationStatus vs = Business.VerificationStatus.valueOf(statusStr.toUpperCase());
                list = businessRepository.findByVerificationStatus(vs);
            } catch (IllegalArgumentException e) {
                list = businessRepository.findAll();
            }
        } else {
            list = businessRepository.findAll();
        }

        return list.stream()
                .map(this::toAdminBusinessResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminBusinessResponse updateBusinessVerification(Integer businessId, StatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));

        Business.VerificationStatus newStatus;
        try {
            newStatus = Business.VerificationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification status: " + request.getStatus());
        }

        if (newStatus == Business.VerificationStatus.REJECTED || newStatus == Business.VerificationStatus.SUSPENDED) {
            if (request.getReason() == null || request.getReason().trim().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A specific reason is required when rejecting or suspending a business.");
            }
        }

        Business.VerificationStatus oldStatus = business.getVerificationStatus();
        business.setVerificationStatus(newStatus);
        User admin = getSystemAdmin();

        if (newStatus == Business.VerificationStatus.APPROVED) {
            business.setVerifiedAt(LocalDateTime.now());
            business.setVerifiedBy(admin);
            business.setVerificationReason(request.getReason() != null && !request.getReason().isBlank() ? request.getReason() : "Verified physical location and business documents.");
        } else if (newStatus == Business.VerificationStatus.REJECTED) {
            business.setVerifiedAt(null);
            business.setVerifiedBy(admin);
            business.setVerificationReason(request.getReason());
        } else if (newStatus == Business.VerificationStatus.SUSPENDED) {
            business.setVerificationReason(request.getReason());
        }

        businessRepository.save(business);

        String action;
        switch (newStatus) {
            case APPROVED -> action = (oldStatus == Business.VerificationStatus.SUSPENDED) ? "RESTORE_BUSINESS" : "APPROVE_BUSINESS";
            case REJECTED -> action = "REJECT_BUSINESS";
            case SUSPENDED -> action = "SUSPEND_BUSINESS";
            default -> action = "UPDATE_BUSINESS_STATUS";
        }

        auditLogRepository.save(new AdminAuditLog(
                admin,
                action,
                "BUSINESS",
                businessId,
                request.getReason() != null ? request.getReason() : "Verification status changed to " + newStatus
        ));

        return toAdminBusinessResponse(business);
    }

    public AdminBusinessResponse toAdminBusinessResponse(Business b) {
        AdminBusinessResponse res = new AdminBusinessResponse(
                b.getBusinessId(),
                b.getBusinessName(),
                b.getUser() != null ? b.getUser().getUserId() : null,
                b.getUser() != null ? b.getUser().getFullName() : null,
                b.getUser() != null ? b.getUser().getEmail() : null,
                b.getDescription(),
                b.getAddress(),
                b.getCity(),
                b.getState(),
                b.getPostalCode(),
                b.getPhone(),
                b.getVerificationStatus().name(),
                b.getCreatedAt()
        );
        if (b.getServiceArea() != null) {
            res.setServiceAreaId(b.getServiceArea().getAreaId());
            res.setServiceAreaName(b.getServiceArea().getAreaName());
            res.setServiceAreaPincode(b.getServiceArea().getPincode());
        }
        res.setVerificationDocument(b.getVerificationDocument());
        res.setVerificationSubmittedAt(b.getVerificationSubmittedAt());
        res.setVerifiedAt(b.getVerifiedAt());
        if (b.getVerifiedBy() != null) {
            res.setVerifiedBy(b.getVerifiedBy().getUserId());
            res.setVerifiedByName(b.getVerifiedBy().getFullName());
        }
        res.setVerificationReason(b.getVerificationReason());
        res.setLatitude(b.getLatitude());
        res.setLongitude(b.getLongitude());
        return res;
    }

    // 4. Categories
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category createCategory(Category category) {
        if (category == null || category.getCategoryName() == null || category.getCategoryName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name cannot be empty");
        }
        Category saved = categoryRepository.save(category);
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                "CREATE_CATEGORY",
                "CATEGORY",
                saved.getCategoryId(),
                "Created category: " + saved.getCategoryName()
        ));
        return saved;
    }

    @Transactional
    public Category updateCategory(Integer categoryId, Category updated) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (updated.getCategoryName() != null && !updated.getCategoryName().trim().isBlank()) {
            cat.setCategoryName(updated.getCategoryName().trim());
        }
        Category saved = categoryRepository.save(cat);
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                "UPDATE_CATEGORY",
                "CATEGORY",
                saved.getCategoryId(),
                "Updated category to: " + saved.getCategoryName()
        ));
        return saved;
    }

    @Transactional
    public void deleteCategory(Integer categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (productRepository.existsByCategory_CategoryId(categoryId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete category with associated products");
        }

        categoryRepository.delete(cat);
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                "DELETE_CATEGORY",
                "CATEGORY",
                categoryId,
                "Deleted category: " + cat.getCategoryName()
        ));
    }

    // 5. Products Moderation
    public List<AdminProductResponse> getProducts(String statusStr, String search) {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .filter(p -> {
                    if (statusStr != null && !statusStr.isBlank()) {
                        try {
                            Product.ListingStatus ls = Product.ListingStatus.valueOf(statusStr.toUpperCase());
                            if (p.getListingStatus() != ls) return false;
                        } catch (IllegalArgumentException ignored) {}
                    }
                    if (search != null && !search.isBlank()) {
                        String query = search.toLowerCase();
                        boolean nameMatch = p.getProductName() != null && p.getProductName().toLowerCase().contains(query);
                        boolean bMatch = p.getBusiness() != null && p.getBusiness().getBusinessName() != null && p.getBusiness().getBusinessName().toLowerCase().contains(query);
                        if (!nameMatch && !bMatch) return false;
                    }
                    return true;
                })
                .map(p -> new AdminProductResponse(
                        p.getProductId(),
                        p.getProductName(),
                        p.getBusiness() != null ? p.getBusiness().getBusinessId() : null,
                        p.getBusiness() != null ? p.getBusiness().getBusinessName() : null,
                        p.getCategory() != null ? p.getCategory().getCategoryId() : null,
                        p.getCategory() != null ? p.getCategory().getCategoryName() : null,
                        p.getPrice(),
                        p.getStockQuantity(),
                        p.getListingStatus().name()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminProductResponse updateProductStatus(Integer productId, StatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        Product.ListingStatus newStatus;
        try {
            newStatus = Product.ListingStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid listing status: " + request.getStatus());
        }

        product.setListingStatus(newStatus);
        productRepository.save(product);

        String action = newStatus == Product.ListingStatus.HIDDEN ? "HIDE_PRODUCT" : "RESTORE_PRODUCT";
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                action,
                "PRODUCT",
                productId,
                request.getReason() != null ? request.getReason() : "Product listing status updated to " + newStatus
        ));

        return new AdminProductResponse(
                product.getProductId(),
                product.getProductName(),
                product.getBusiness() != null ? product.getBusiness().getBusinessId() : null,
                product.getBusiness() != null ? product.getBusiness().getBusinessName() : null,
                product.getCategory() != null ? product.getCategory().getCategoryId() : null,
                product.getCategory() != null ? product.getCategory().getCategoryName() : null,
                product.getPrice(),
                product.getStockQuantity(),
                product.getListingStatus().name()
        );
    }

    // 6. Reviews Moderation
    public List<AdminReviewResponse> getReviews(String statusStr) {
        List<Review> reviews = reviewRepository.findAll();

        return reviews.stream()
                .filter(r -> {
                    if (statusStr != null && !statusStr.isBlank()) {
                        try {
                            Review.ReviewStatus rs = Review.ReviewStatus.valueOf(statusStr.toUpperCase());
                            if (r.getReviewStatus() != rs) return false;
                        } catch (IllegalArgumentException ignored) {}
                    }
                    return true;
                })
                .map(r -> new AdminReviewResponse(
                        r.getReviewId(),
                        r.getOrder() != null ? r.getOrder().getOrderId() : null,
                        r.getProduct() != null ? r.getProduct().getProductId() : null,
                        r.getProduct() != null ? r.getProduct().getProductName() : null,
                        r.getOrder() != null && r.getOrder().getUser() != null ? r.getOrder().getUser().getFullName() : "Customer",
                        r.getRating(),
                        r.getComment(),
                        r.getReviewStatus().name(),
                        r.getReviewDate()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminReviewResponse updateReviewStatus(Integer reviewId, StatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        Review.ReviewStatus newStatus;
        try {
            newStatus = Review.ReviewStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid review status: " + request.getStatus());
        }

        review.setReviewStatus(newStatus);
        reviewRepository.save(review);

        String action = newStatus == Review.ReviewStatus.HIDDEN ? "HIDE_REVIEW" : "RESTORE_REVIEW";
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                action,
                "REVIEW",
                reviewId,
                request.getReason() != null ? request.getReason() : "Review status updated to " + newStatus
        ));

        return new AdminReviewResponse(
                review.getReviewId(),
                review.getOrder() != null ? review.getOrder().getOrderId() : null,
                review.getProduct() != null ? review.getProduct().getProductId() : null,
                review.getProduct() != null ? review.getProduct().getProductName() : null,
                review.getOrder() != null && review.getOrder().getUser() != null ? review.getOrder().getUser().getFullName() : "Customer",
                review.getRating(),
                review.getComment(),
                review.getReviewStatus().name(),
                review.getReviewDate()
        );
    }

    // 7. Audit Logs
    public List<AdminAuditLogResponse> getAuditLogs(String action, String entityType) {
        List<AdminAuditLog> logs;
        if (action != null && !action.isBlank() && entityType != null && !entityType.isBlank()) {
            logs = auditLogRepository.findByActionAndEntityTypeOrderByCreatedAtDesc(action, entityType);
        } else if (action != null && !action.isBlank()) {
            logs = auditLogRepository.findByActionOrderByCreatedAtDesc(action);
        } else if (entityType != null && !entityType.isBlank()) {
            logs = auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType);
        } else {
            logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        }

        return logs.stream()
                .map(l -> new AdminAuditLogResponse(
                        l.getAuditId(),
                        l.getAdminUser() != null ? l.getAdminUser().getUserId() : null,
                        l.getAdminUser() != null ? l.getAdminUser().getFullName() : "Admin",
                        l.getAdminUser() != null ? l.getAdminUser().getEmail() : null,
                        l.getAction(),
                        l.getEntityType(),
                        l.getEntityId(),
                        l.getReason(),
                        l.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // 8. Service Areas
    public List<ServiceArea> getServiceAreas() {
        return serviceAreaRepository.findAll();
    }

    @Transactional
    public ServiceArea createServiceArea(ServiceArea area) {
        if (area.getAreaName() == null || area.getAreaName().isBlank() ||
            area.getPincode() == null || area.getPincode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Area name and pincode are required");
        }
        ServiceArea saved = serviceAreaRepository.save(area);
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                "CREATE_SERVICE_AREA",
                "SERVICE_AREA",
                saved.getAreaId(),
                "Created service area: " + saved.getAreaName() + " (" + saved.getPincode() + ")"
        ));
        return saved;
    }

    @Transactional
    public ServiceArea updateServiceArea(Integer id, ServiceArea updated) {
        ServiceArea area = serviceAreaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service area not found"));

        if (updated.getAreaName() != null) area.setAreaName(updated.getAreaName());
        if (updated.getCity() != null) area.setCity(updated.getCity());
        if (updated.getState() != null) area.setState(updated.getState());
        if (updated.getPincode() != null) area.setPincode(updated.getPincode());
        if (updated.getStatus() != null) area.setStatus(updated.getStatus());

        ServiceArea saved = serviceAreaRepository.save(area);
        auditLogRepository.save(new AdminAuditLog(
                getSystemAdmin(),
                "UPDATE_SERVICE_AREA",
                "SERVICE_AREA",
                id,
                "Updated service area: " + saved.getAreaName()
        ));
        return saved;
    }

    // 9. Collaborations Oversight
    public List<CollaborationResponse> getCollaborations(String status) {
        return collaborationService.getAllCollaborations(status);
    }

    @Transactional
    public CollaborationResponse updateCollaborationStatus(Integer id, StatusUpdateRequest request) {
        return collaborationService.updateStatus(id, request.getStatus(), null, request.getReason());
    }
}
