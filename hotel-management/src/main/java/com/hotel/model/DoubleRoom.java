package com.hotel.model;

/**
 * Concrete Room subclass representing a Double Occupancy Room.
 * Demonstrates Polymorphism by overriding {@link Room#calculateTariff(int)}.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class DoubleRoom extends Room {

    public DoubleRoom() {
        super();
        setRoomType("DOUBLE");
        setMaxOccupancy(2);
    }

    public DoubleRoom(Long id, String roomNumber, double pricePerNight, String status, String description, String imageUrl) {
        super(id, roomNumber, "DOUBLE", pricePerNight, status, 2, description, imageUrl);
    }

    /**
     * Polymorphic implementation of {@code calculateTariff}.
     * Double rooms calculate tariff for standard dual occupancy.
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
