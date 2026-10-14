package com.hotel.model;

/**
 * Abstract class representing a human actor in the Hotel Management System.
 * Demonstrates Inheritance (base class for Customer and Employee) and Encapsulation
 * (private fields, validated getters and setters).
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public abstract class Person {

    private Long id;
    private String name;
    private String email;
    private String phone;

    /**
     * Default no-argument constructor.
     */
    public Person() {
    }

    /**
     * Parameterized constructor demonstrating constructor initialization.
     *
     * @param id    Unique identifier
     * @param name  Full name of the person
     * @param email Email address
     * @param phone 10-digit mobile contact number
     */
    public Person(Long id, String name, String email, String phone) {
        this.id = id;
        setName(name);
        setEmail(email);
        setPhone(phone);
    }

    /**
     * Abstract method enforcing Polymorphic role title resolution in derived classes.
     *
     * @return Title or designation of the individual
     */
    public abstract String getRoleTitle();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Person name cannot be null or empty.");
        }
        this.name = name.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format provided: " + email);
        }
        this.email = email.trim();
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        if (phone == null || !phone.matches("^[0-9]{10}$")) {
            throw new IllegalArgumentException("Phone number must be exactly 10 digits: " + phone);
        }
        this.phone = phone.trim();
    }

    @Override
    public String toString() {
        return "Person{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", roleTitle='" + getRoleTitle() + '\'' +
                '}';
    }
}
