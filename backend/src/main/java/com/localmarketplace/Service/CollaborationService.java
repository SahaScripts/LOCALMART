package com.localmarketplace.Service;

import com.localmarketplace.dto.*;
import com.localmarketplace.entity.*;
import com.localmarketplace.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollaborationService {

    private final CollaborationRepository collaborationRepository;
    private final CollaborationProductRepository collaborationProductRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public CollaborationService(
            CollaborationRepository collaborationRepository,
            CollaborationProductRepository collaborationProductRepository,
            BusinessRepository businessRepository,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            AdminAuditLogRepository auditLogRepository,
            UserRepository userRepository) {

        this.collaborationRepository = collaborationRepository;
        this.collaborationProductRepository = collaborationProductRepository;
        this.businessRepository = businessRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public List<CollaborationResponse> getAllCollaborations(String statusStr) {
        List<Collaboration> list;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                Collaboration.Status s = Collaboration.Status.valueOf(statusStr.toUpperCase());
                list = collaborationRepository.findByStatus(s);
            } catch (IllegalArgumentException e) {
                list = collaborationRepository.findAll();
            }
        } else {
            list = collaborationRepository.findAll();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CollaborationResponse> getCollaborationsForBusiness(Integer businessId, String statusStr) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found: " + businessId);
        }

        List<Collaboration> list;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                Collaboration.Status s = Collaboration.Status.valueOf(statusStr.toUpperCase());
                list = collaborationRepository.findByBusinessIdAndStatus(businessId, s);
            } catch (IllegalArgumentException e) {
                list = collaborationRepository.findByBusinessId(businessId);
            }
        } else {
            list = collaborationRepository.findByBusinessId(businessId);
        }

        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CollaborationResponse getCollaborationById(Integer id) {
        Collaboration collab = collaborationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaboration not found"));
        return toResponse(collab);
    }

    @Transactional
    public CollaborationResponse proposeCollaboration(CollaborationRequest request) {
        if (request.getInitiatorBusinessId().equals(request.getPartnerBusinessId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A business cannot collaborate with itself");
        }

        Business initiator = businessRepository.findById(request.getInitiatorBusinessId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Initiator business not found"));

        Business partner = businessRepository.findById(request.getPartnerBusinessId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partner business not found"));

        if (initiator.getVerificationStatus() != Business.VerificationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Initiator business must be verified and approved to propose collaborations");
        }

        if (partner.getVerificationStatus() != Business.VerificationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Partner business must be verified and approved to receive collaborations");
        }

        if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Collaboration title is required");
        }

        String collabType = request.getCollaborationType() != null && !request.getCollaborationType().isBlank()
                ? request.getCollaborationType().trim()
                : "COMBO_OFFER";

        Collaboration collab = new Collaboration(
                initiator,
                partner,
                request.getTitle().trim(),
                request.getDescription(),
                collabType,
                Collaboration.Status.PENDING
        );

        Collaboration saved = collaborationRepository.save(collab);

        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            for (Integer pId : request.getProductIds()) {
                productRepository.findById(pId).ifPresent(p -> {
                    CollaborationProduct cp = new CollaborationProduct(saved, p, p.getBusiness());
                    collaborationProductRepository.save(cp);
                });
            }
        }

        recordAuditLog("PROPOSE_COLLABORATION", "COLLABORATION", saved.getCollaborationId(),
                "Collaboration proposed by " + initiator.getBusinessName() + " to " + partner.getBusinessName());

        return toResponse(saved);
    }

    @Transactional
    public CollaborationResponse updateStatus(Integer collaborationId, String newStatusStr, Integer actingBusinessId, String reason) {
        Collaboration collab = collaborationRepository.findById(collaborationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaboration not found"));

        Collaboration.Status newStatus;
        try {
            newStatus = Collaboration.Status.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid collaboration status: " + newStatusStr);
        }

        if (newStatus == Collaboration.Status.REJECTED && (reason == null || reason.trim().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A reason is required when rejecting a collaboration proposal");
        }

        collab.setStatus(newStatus);
        Collaboration saved = collaborationRepository.save(collab);

        recordAuditLog("COLLABORATION_STATUS_" + newStatus, "COLLABORATION", saved.getCollaborationId(),
                "Collaboration status updated to " + newStatus + (reason != null ? " - Reason: " + reason : ""));

        return toResponse(saved);
    }

    @Transactional
    public Product createCollaborativeProduct(CollaborativeProductCreateRequest request) {
        Collaboration collab = collaborationRepository.findById(request.getCollaborationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaboration not found"));

        if (collab.getStatus() != Collaboration.Status.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Collaboration must be in ACCEPTED status to create collaborative products");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        // Use initiator business as the primary host business for the collaborative listing
        Business primaryBusiness = collab.getInitiatorBusiness();

        Product product = new Product(
                primaryBusiness,
                category,
                request.getProductName(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity()
        );
        product.setIsCollaborative(true);
        product.setCollaboration(collab);

        Product savedProduct = productRepository.save(product);

        // Link product to both businesses in collaboration_products
        CollaborationProduct cpInitiator = new CollaborationProduct(collab, savedProduct, collab.getInitiatorBusiness());
        CollaborationProduct cpPartner = new CollaborationProduct(collab, savedProduct, collab.getPartnerBusiness());
        collaborationProductRepository.save(cpInitiator);
        collaborationProductRepository.save(cpPartner);

        recordAuditLog("CREATE_COLLABORATIVE_PRODUCT", "PRODUCT", savedProduct.getProductId(),
                "Collaborative product '" + savedProduct.getProductName() + "' created for collaboration #" + collab.getCollaborationId());

        return savedProduct;
    }

    public CollaborationResponse toResponse(Collaboration c) {
        CollaborationResponse res = new CollaborationResponse();
        res.setCollaborationId(c.getCollaborationId());

        if (c.getInitiatorBusiness() != null) {
            Business init = c.getInitiatorBusiness();
            res.setInitiatorBusinessId(init.getBusinessId());
            res.setInitiatorBusinessName(init.getBusinessName());
            res.setInitiatorPhone(init.getPhone());
            res.setInitiatorAddress(init.getAddress() + ", " + init.getCity());
            if (init.getUser() != null) {
                res.setInitiatorOwnerName(init.getUser().getFullName());
                res.setInitiatorOwnerEmail(init.getUser().getEmail());
            }
        }

        if (c.getPartnerBusiness() != null) {
            Business partner = c.getPartnerBusiness();
            res.setPartnerBusinessId(partner.getBusinessId());
            res.setPartnerBusinessName(partner.getBusinessName());
            res.setPartnerPhone(partner.getPhone());
            res.setPartnerAddress(partner.getAddress() + ", " + partner.getCity());
            if (partner.getUser() != null) {
                res.setPartnerOwnerName(partner.getUser().getFullName());
                res.setPartnerOwnerEmail(partner.getUser().getEmail());
            }
        }

        res.setTitle(c.getTitle());
        res.setDescription(c.getDescription());
        res.setCollaborationType(c.getCollaborationType());
        res.setStatus(c.getStatus().name());
        res.setCreatedAt(c.getCreatedAt());
        res.setUpdatedAt(c.getUpdatedAt());

        List<CollaborationProduct> cps = collaborationProductRepository.findByCollaboration_CollaborationId(c.getCollaborationId());
        List<AdminProductResponse> products = new ArrayList<>();
        for (CollaborationProduct cp : cps) {
            Product p = cp.getProduct();
            if (p != null) {
                products.add(new AdminProductResponse(
                        p.getProductId(),
                        p.getProductName(),
                        p.getBusiness() != null ? p.getBusiness().getBusinessId() : null,
                        p.getBusiness() != null ? p.getBusiness().getBusinessName() : null,
                        p.getCategory() != null ? p.getCategory().getCategoryId() : null,
                        p.getCategory() != null ? p.getCategory().getCategoryName() : null,
                        p.getPrice(),
                        p.getStockQuantity(),
                        p.getListingStatus().name()
                ));
            }
        }
        res.setLinkedProducts(products);

        return res;
    }

    private void recordAuditLog(String action, String entityType, Integer entityId, String details) {
        try {
            User admin = userRepository.findByRole(User.Role.ADMIN).stream().findFirst().orElse(null);
            if (admin != null) {
                auditLogRepository.save(new AdminAuditLog(admin, action, entityType, entityId, details));
            }
        } catch (Exception ignored) {
        }
    }
}
