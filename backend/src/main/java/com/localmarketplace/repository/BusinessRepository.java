package com.localmarketplace.repository;

import com.localmarketplace.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Integer> {

    List<Business> findByVerificationStatus(Business.VerificationStatus verificationStatus);

    long countByVerificationStatus(Business.VerificationStatus verificationStatus);

    java.util.Optional<Business> findByUser(com.localmarketplace.entity.User user);

    java.util.Optional<Business> findByUser_UserId(Integer userId);
}