package com.localmarketplace.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "collaborations")
public class Collaboration {

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED,
        CANCELLED,
        COMPLETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collaboration_id")
    private Integer collaborationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "initiator_business_id", referencedColumnName = "business_id", nullable = false)
    private Business initiatorBusiness;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partner_business_id", referencedColumnName = "business_id", nullable = false)
    private Business partnerBusiness;

    @NotBlank
    @Size(max = 200)
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Size(max = 50)
    @Column(name = "collaboration_type", nullable = false, length = 50)
    private String collaborationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "collaboration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CollaborationProduct> collaborationProducts = new ArrayList<>();

    public Collaboration() {
    }

    public Collaboration(Business initiatorBusiness, Business partnerBusiness, String title, String description, String collaborationType, Status status) {
        this.initiatorBusiness = initiatorBusiness;
        this.partnerBusiness = partnerBusiness;
        this.title = title;
        this.description = description;
        this.collaborationType = collaborationType;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getCollaborationId() {
        return collaborationId;
    }

    public void setCollaborationId(Integer collaborationId) {
        this.collaborationId = collaborationId;
    }

    public Business getInitiatorBusiness() {
        return initiatorBusiness;
    }

    public void setInitiatorBusiness(Business initiatorBusiness) {
        this.initiatorBusiness = initiatorBusiness;
    }

    public Business getPartnerBusiness() {
        return partnerBusiness;
    }

    public void setPartnerBusiness(Business partnerBusiness) {
        this.partnerBusiness = partnerBusiness;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
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

    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<CollaborationProduct> getCollaborationProducts() {
        return collaborationProducts;
    }

    public void setCollaborationProducts(List<CollaborationProduct> collaborationProducts) {
        this.collaborationProducts = collaborationProducts;
    }
}
