package com.localmarketplace.repository;

import com.localmarketplace.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Integer> {

    List<AdminAuditLog> findAllByOrderByCreatedAtDesc();

    List<AdminAuditLog> findByActionOrderByCreatedAtDesc(String action);

    List<AdminAuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);

    List<AdminAuditLog> findByActionAndEntityTypeOrderByCreatedAtDesc(String action, String entityType);
}
