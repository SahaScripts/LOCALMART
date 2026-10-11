
package com.localmarketplace.controller;

import com.localmarketplace.entity.User;
import com.localmarketplace.Service.UserService;
import com.localmarketplace.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Create a new user
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // Update an existing user
    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Integer id,
            @RequestBody User userDetails) {

        User user = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEmail(userDetails.getEmail());
        user.setPasswordHash(userDetails.getPasswordHash());
        user.setRole(userDetails.getRole());
        user.setFullName(userDetails.getFullName());
        user.setPhone(userDetails.getPhone());
        user.setAddress(userDetails.getAddress());

        return userService.saveUser(user);
    }

    // Delete a user
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Integer id) {

        userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userService.deleteUser(id);

        return "User deleted successfully";
    }
}