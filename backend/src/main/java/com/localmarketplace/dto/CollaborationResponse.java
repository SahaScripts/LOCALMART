package com.localmarketplace.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CollaborationResponse {

    private Integer collaborationId;
    private Integer initiatorBusinessId;
    private String initiatorBusinessName;
    private String initiatorOwnerName;
    private String initiatorOwnerEmail;
    private String initiatorPhone;
    private String initiatorAddress;

    private Integer partnerBusinessId;
    private String partnerBusinessName;
    private String partnerOwnerName;
    private String partnerOwnerEmail;
    private String partnerPhone;
    private String partnerAddress;

    private String title;
    private String description;
    private String collaborationType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<AdminProductResponse> linkedProducts;

    public CollaborationResponse() {
    }

    public Integer getCollaborationId() {
        return collaborationId;
    }

    public void setCollaborationId(Integer collaborationId) {
        this.collaborationId = collaborationId;
    }

    public Integer getInitiatorBusinessId() {
        return initiatorBusinessId;
    }

    public void setInitiatorBusinessId(Integer initiatorBusinessId) {
        this.initiatorBusinessId = initiatorBusinessId;
    }

    public String getInitiatorBusinessName() {
        return initiatorBusinessName;
    }

    public void setInitiatorBusinessName(String initiatorBusinessName) {
        this.initiatorBusinessName = initiatorBusinessName;
    }

    public String getInitiatorOwnerName() {
        return initiatorOwnerName;
    }

    public void setInitiatorOwnerName(String initiatorOwnerName) {
        this.initiatorOwnerName = initiatorOwnerName;
    }

    public String getInitiatorOwnerEmail() {
        return initiatorOwnerEmail;
    }

    public void setInitiatorOwnerEmail(String initiatorOwnerEmail) {
        this.initiatorOwnerEmail = initiatorOwnerEmail;
    }

    public String getInitiatorPhone() {
        return initiatorPhone;
    }

    public void setInitiatorPhone(String initiatorPhone) {
        this.initiatorPhone = initiatorPhone;
    }

    public String getInitiatorAddress() {
        return initiatorAddress;
    }

    public void setInitiatorAddress(String initiatorAddress) {
        this.initiatorAddress = initiatorAddress;
    }

    public Integer getPartnerBusinessId() {
        return partnerBusinessId;
    }

    public void setPartnerBusinessId(Integer partnerBusinessId) {
        this.partnerBusinessId = partnerBusinessId;
    }

    public String getPartnerBusinessName() {
        return partnerBusinessName;
    }

    public void setPartnerBusinessName(String partnerBusinessName) {
        this.partnerBusinessName = partnerBusinessName;
    }

    public String getPartnerOwnerName() {
        return partnerOwnerName;
    }

    public void setPartnerOwnerName(String partnerOwnerName) {
        this.partnerOwnerName = partnerOwnerName;
    }

    public String getPartnerOwnerEmail() {
        return partnerOwnerEmail;
    }

    public void setPartnerOwnerEmail(String partnerOwnerEmail) {
        this.partnerOwnerEmail = partnerOwnerEmail;
    }

    public String getPartnerPhone() {
        return partnerPhone;
    }

    public void setPartnerPhone(String partnerPhone) {
        this.partnerPhone = partnerPhone;
    }

    public String getPartnerAddress() {
        return partnerAddress;
    }

    public void setPartnerAddress(String partnerAddress) {
        this.partnerAddress = partnerAddress;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCollaborationType() {
        return collaborationType;
    }

    public void setCollaborationType(String collaborationType) {
        this.collaborationType = collaborationType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AdminProductResponse> getLinkedProducts() {
        return linkedProducts;
    }

    public void setLinkedProducts(List<AdminProductResponse> linkedProducts) {
        this.linkedProducts = linkedProducts;
    }
}
