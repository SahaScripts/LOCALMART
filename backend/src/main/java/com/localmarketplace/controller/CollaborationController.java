package com.localmarketplace.controller;

import com.localmarketplace.Service.CollaborationService;
import com.localmarketplace.dto.*;
import com.localmarketplace.entity.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collaborations")
public class CollaborationController {

    private final CollaborationService collaborationService;

    public CollaborationController(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    // List all collaborations (optional filter by status, e.g. ACCEPTED)
    @GetMapping
    public List<CollaborationResponse> getAllCollaborations(
            @RequestParam(required = false) String status) {
        return collaborationService.getAllCollaborations(status);
    }

    // Get specific collaboration by ID
    @GetMapping("/{id}")
    public ResponseEntity<CollaborationResponse> getCollaborationById(@PathVariable Integer id) {
        return ResponseEntity.ok(collaborationService.getCollaborationById(id));
    }

    // Get collaborations for a specific business
    @GetMapping("/business/{businessId}")
    public List<CollaborationResponse> getCollaborationsForBusiness(
            @PathVariable Integer businessId,
            @RequestParam(required = false) String status) {
        return collaborationService.getCollaborationsForBusiness(businessId, status);
    }

    // Propose a new collaboration between two approved businesses
    @PostMapping
    public ResponseEntity<CollaborationResponse> proposeCollaboration(
            @RequestBody CollaborationRequest request) {
        return ResponseEntity.ok(collaborationService.proposeCollaboration(request));
    }

    // Update collaboration status (ACCEPT, REJECT, CANCEL, COMPLETE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<CollaborationResponse> updateCollaborationStatus(
            @PathVariable Integer id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(collaborationService.updateStatus(
                id,
                request.getStatus(),
                null,
                request.getReason()
        ));
    }

    // Create a collaborative product for an accepted collaboration
    @PostMapping("/create-product")
    public ResponseEntity<Product> createCollaborativeProduct(
            @RequestBody CollaborativeProductCreateRequest request) {
        return ResponseEntity.ok(collaborationService.createCollaborativeProduct(request));
    }
}
