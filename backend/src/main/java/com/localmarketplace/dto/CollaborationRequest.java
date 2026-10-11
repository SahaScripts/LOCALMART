package com.localmarketplace.dto;

import java.util.List;

public class CollaborationRequest {

    private Integer initiatorBusinessId;
    private Integer partnerBusinessId;
    private String title;
    private String description;
    private String collaborationType;
    private List<Integer> productIds;

    public CollaborationRequest() {
    }

    public CollaborationRequest(Integer initiatorBusinessId, Integer partnerBusinessId, String title, String description, String collaborationType, List<Integer> productIds) {
        this.initiatorBusinessId = initiatorBusinessId;
        this.partnerBusinessId = partnerBusinessId;
        this.title = title;
        this.description = description;
        this.collaborationType = collaborationType;
        this.productIds = productIds;
    }

    public Integer getInitiatorBusinessId() {
        return initiatorBusinessId;
    }

    public void setInitiatorBusinessId(Integer initiatorBusinessId) {
        this.initiatorBusinessId = initiatorBusinessId;
    }

    public Integer getPartnerBusinessId() {
        return partnerBusinessId;
    }

    public void setPartnerBusinessId(Integer partnerBusinessId) {
        this.partnerBusinessId = partnerBusinessId;
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

    public List<Integer> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Integer> productIds) {
        this.productIds = productIds;
    }
}
