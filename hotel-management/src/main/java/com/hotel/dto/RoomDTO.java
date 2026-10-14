package com.hotel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for Room creation and updates.
 */
public class RoomDTO {

    private Long id;

    @NotBlank(message = "Room number is required.")
    private String roomNumber;

    @NotBlank(message = "Room type (SINGLE, DOUBLE, DELUXE, SUITE) is required.")
    private String roomType;

    @NotNull(message = "Price per night is required.")
    @DecimalMin(value = "100.0", message = "Price per night must be at least ₹100.")
    private Double pricePerNight;

    private String status = "AVAILABLE";

    @NotNull(message = "Max occupancy is required.")
    @Min(value = 1, message = "Max occupancy must be at least 1 person.")
    private Integer maxOccupancy;

    private String description;
    private String imageUrl;

    public RoomDTO() {
    }

    public RoomDTO(Long id, String roomNumber, String roomType, Double pricePerNight,
                   String status, Integer maxOccupancy, String description, String imageUrl) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.status = status;
        this.maxOccupancy = maxOccupancy;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(Double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getMaxOccupancy() {
        return maxOccupancy;
    }

    public void setMaxOccupancy(Integer maxOccupancy) {
        this.maxOccupancy = maxOccupancy;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
