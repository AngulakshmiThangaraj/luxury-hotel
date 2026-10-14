package com.hotel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for adding an auxiliary service item to an active booking.
 */
public class AddServiceRequestDTO {

    @NotNull(message = "Service ID is required.")
    private Long serviceId;

    @NotNull(message = "Quantity is required.")
    @Min(value = 1, message = "Quantity must be at least 1.")
    private Integer quantity;

    public AddServiceRequestDTO() {
    }

    public AddServiceRequestDTO(Long serviceId, Integer quantity) {
        this.serviceId = serviceId;
        this.quantity = quantity;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
