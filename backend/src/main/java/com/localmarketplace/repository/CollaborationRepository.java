package com.localmarketplace.repository;

import com.localmarketplace.entity.Collaboration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollaborationRepository extends JpaRepository<Collaboration, Integer> {

    List<Collaboration> findByStatus(Collaboration.Status status);

    @Query("SELECT c FROM Collaboration c WHERE c.initiatorBusiness.businessId = :businessId OR c.partnerBusiness.businessId = :businessId ORDER BY c.createdAt DESC")
    List<Collaboration> findByBusinessId(@Param("businessId") Integer businessId);

    @Query("SELECT c FROM Collaboration c WHERE (c.initiatorBusiness.businessId = :businessId OR c.partnerBusiness.businessId = :businessId) AND c.status = :status ORDER BY c.createdAt DESC")
    List<Collaboration> findByBusinessIdAndStatus(@Param("businessId") Integer businessId, @Param("status") Collaboration.Status status);

    long countByStatus(Collaboration.Status status);
}
