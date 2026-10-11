package com.localmarketplace.repository;

import com.localmarketplace.entity.CartItem;
import com.localmarketplace.entity.CartItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {

    List<CartItem> findByCart_CartId(Integer cartId);
}