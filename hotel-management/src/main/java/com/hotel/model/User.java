package com.hotel.model;

import java.time.LocalDateTime;

/**
 * System User model representing authenticated login credentials and role assignment.
 * Roles: "ADMIN", "RECEPTIONIST"
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class User {

    private Long id;
    private String username;
    private String passwordHash;
    private String fullName;
    private String role; // "ADMIN" or "RECEPTIONIST"
    private LocalDateTime createdAt;

    public User() {
    }

    public User(Long id, String username, String passwordHash, String fullName, String role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
