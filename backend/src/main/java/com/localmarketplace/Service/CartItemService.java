
package com.localmarketplace.Service;

import com.localmarketplace.entity.CartItem;
import com.localmarketplace.entity.CartItemId;
import com.localmarketplace.repository.CartItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;

    public CartItemService(CartItemRepository cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }

    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }
    public List<CartItem> getCartItemsByCartId(Integer cartId) {
        return cartItemRepository.findByCart_CartId(cartId);
    }
    public Optional<CartItem> getCartItemById(CartItemId id) {
        return cartItemRepository.findById(id);
    }

    public CartItem saveCartItem(CartItem cartItem) {
        return cartItemRepository.save(cartItem);
    }

    public void deleteCartItem(CartItemId id) {
        cartItemRepository.deleteById(id);
    }
}
