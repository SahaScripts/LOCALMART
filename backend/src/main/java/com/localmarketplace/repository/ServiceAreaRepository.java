package com.localmarketplace.repository;

import com.localmarketplace.entity.ServiceArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceAreaRepository extends JpaRepository<ServiceArea, Integer> {

    List<ServiceArea> findByStatus(ServiceArea.Status status);

    List<ServiceArea> findByPincode(String pincode);

    boolean existsByPincodeAndStatus(String pincode, ServiceArea.Status status);

    Optional<ServiceArea> findByPincodeAndAreaNameIgnoreCase(String pincode, String areaName);
}
