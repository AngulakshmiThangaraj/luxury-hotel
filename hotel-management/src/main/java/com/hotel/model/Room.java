package com.hotel.model;

/**
 * Abstract class representing a generic Hotel Room.
 * Implements {@link Billable} interface to provide contract compliance for billing.
 * Demonstrates Abstraction, Encapsulation, and Polymorphism via the abstract method {@code calculateTariff(int nights)}.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public abstract class Room implements Billable {

    private Long id;
    private String roomNumber;
    private String roomType; // SINGLE, DOUBLE, DELUXE, SUITE
    private double pricePerNight;
    private String status;   // AVAILABLE, OCCUPIED, MAINTENANCE
    private int maxOccupancy;
    private String description;
    private String imageUrl;

    public Room() {
    }

    public Room(Long id, String roomNumber, String roomType, double pricePerNight,
                String status, int maxOccupancy, String description, String imageUrl) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        setPricePerNight(pricePerNight);
        this.status = (status != null) ? status : "AVAILABLE";
        this.maxOccupancy = maxOccupancy;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    /**
     * Polymorphic method to calculate total tariff for the given number of nights.
     * Each concrete room type (Single, Double, Deluxe, Suite) provides its own tariff formulation.
     *
     * @param nights Total number of nights
     * @return Calculated tariff before tax
     */
    @Override
    public abstract double calculateTariff(int nights);

    @Override
    public double getBaseRate() {
        return pricePerNight;
    }

    @Override
    public String getBillingItemDescription() {
        return "Room " + roomNumber + " [" + roomType + " Tier]";
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
        if (roomNumber == null || roomNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Room number cannot be empty.");
        }
        this.roomNumber = roomNumber.trim();
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        if (pricePerNight <= 0) {
            throw new IllegalArgumentException("Price per night must be greater than zero: " + pricePerNight);
        }
        this.pricePerNight = pricePerNight;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        if (status == null || (!status.equalsIgnoreCase("AVAILABLE") &&
                !status.equalsIgnoreCase("OCCUPIED") &&
                !status.equalsIgnoreCase("MAINTENANCE"))) {
            throw new IllegalArgumentException("Invalid room status: " + status);
        }
        this.status = status.toUpperCase();
    }

    public int getMaxOccupancy() {
        return maxOccupancy;
    }

    public void setMaxOccupancy(int maxOccupancy) {
        if (maxOccupancy < 1) {
            throw new IllegalArgumentException("Max occupancy must be at least 1 person.");
        }
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
