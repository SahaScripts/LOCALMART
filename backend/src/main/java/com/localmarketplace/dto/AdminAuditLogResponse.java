package com.localmarketplace.dto;

import java.time.LocalDateTime;

public class AdminAuditLogResponse {

    private Integer auditId;
    private Integer adminUserId;
    private String adminName;
    private String adminEmail;
    private String action;
    private String entityType;
    private Integer entityId;
    private String reason;
    private LocalDateTime createdAt;

    public AdminAuditLogResponse() {
    }

    public AdminAuditLogResponse(
            Integer auditId,
            Integer adminUserId,
            String adminName,
            String adminEmail,
            String action,
            String entityType,
            Integer entityId,
            String reason,
            LocalDateTime createdAt
    ) {
        this.auditId = auditId;
        this.adminUserId = adminUserId;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public Integer getAuditId() {
        return auditId;
    }

    public void setAuditId(Integer auditId) {
        this.auditId = auditId;
    }

    public Integer getAdminUserId() {
        return adminUserId;
    }

    public void setAdminUserId(Integer adminUserId) {
        this.adminUserId = adminUserId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Integer getEntityId() {
        return entityId;
    }

    public void setEntityId(Integer entityId) {
        this.entityId = entityId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
