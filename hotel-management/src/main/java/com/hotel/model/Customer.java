package com.hotel.model;

import java.time.LocalDateTime;

/**
 * Concrete subclass representing a hotel guest/customer.
 * Inherits common identity properties from {@link Person}.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class Customer extends Person {

    private String idProof;
    private String address;
    private LocalDateTime createdAt;

    public Customer() {
        super();
    }

    public Customer(Long id, String name, String email, String phone, String idProof, String address) {
        super(id, name, email, phone);
        this.idProof = idProof;
        this.address = address;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Polymorphic implementation of {@link Person#getRoleTitle()}.
     *
     * @return Specific role representation for guest
     */
    @Override
    public String getRoleTitle() {
        return "Hotel Guest";
    }

    public String getIdProof() {
        return idProof;
    }

    public void setIdProof(String idProof) {
        this.idProof = idProof;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", phone='" + getPhone() + '\'' +
                ", idProof='" + idProof + '\'' +
                '}';
    }
}
