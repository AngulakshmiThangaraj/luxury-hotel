package com.hotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Data Transfer Object for Customer creation and update requests.
 * Uses JSR-380 Bean Validation for strict input constraints.
 */
public class CustomerDTO {

    private Long id;

    @NotBlank(message = "Customer name is required.")
    private String name;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Phone number is required.")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits.")
    private String phone;

    @NotBlank(message = "Identity proof (Aadhaar, Passport, DL) is required.")
    private String idProof;

    private String address;

    public CustomerDTO() {
    }

    public CustomerDTO(Long id, String name, String email, String phone, String idProof, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.idProof = idProof;
        this.address = address;
    }

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
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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
}
