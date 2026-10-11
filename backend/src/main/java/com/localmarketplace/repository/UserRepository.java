package com.localmarketplace.repository;

import com.localmarketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    List<User> findByRole(User.Role role);

    List<User> findByAccountStatus(User.AccountStatus accountStatus);

    List<User> findByRoleAndAccountStatus(User.Role role, User.AccountStatus accountStatus);

    long countByRole(User.Role role);

    long countByAccountStatus(User.AccountStatus accountStatus);

    java.util.Optional<User> findByEmailIgnoreCase(String email);
}