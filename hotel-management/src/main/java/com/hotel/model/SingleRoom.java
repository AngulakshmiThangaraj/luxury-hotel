package com.hotel.model;

/**
 * Concrete Room subclass representing a Single Occupancy Room.
 * Demonstrates Polymorphism by overriding {@link Room#calculateTariff(int)}.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class SingleRoom extends Room {

    public SingleRoom() {
        super();
        setRoomType("SINGLE");
        setMaxOccupancy(1);
    }

    public SingleRoom(Long id, String roomNumber, double pricePerNight, String status, String description, String imageUrl) {
        super(id, roomNumber, "SINGLE", pricePerNight, status, 1, description, imageUrl);
    }

    /**
     * Polymorphic implementation of {@code calculateTariff}.
     * Single rooms have standard linear night-based calculation.
     *
     * @param nights Number of nights of stay
     * @return Total room tariff
     */
    @Override
    public double calculateTariff(int nights) {
        if (nights <= 0) {
            throw new IllegalArgumentException("Nights of stay must be at least 1.");
        }
        return getPricePerNight() * nights;
    }
}
