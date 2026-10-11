package com.localmarketplace.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "category_name", nullable = false, unique = true)
    private String categoryName;

    // Default constructor
    public Category() {
    }

    // Constructor
    public Category(String categoryName) {
        this.categoryName = categoryName;
    }

    // Getter
    public Integer getCategoryId() {
        return categoryId;
    }

    // Setter
    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    // Getter
    public String getCategoryName() {
        return categoryName;
    }

    // Setter
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}