package com.localmarketplace.repository;

import com.localmarketplace.entity.CollaborationProduct;
import com.localmarketplace.entity.CollaborationProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollaborationProductRepository extends JpaRepository<CollaborationProduct, CollaborationProductId> {

    List<CollaborationProduct> findByCollaboration_CollaborationId(Integer collaborationId);

    List<CollaborationProduct> findByBusiness_BusinessId(Integer businessId);
}
