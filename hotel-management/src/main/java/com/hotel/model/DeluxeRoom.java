package com.hotel.model;

/**
 * Concrete Room subclass representing an Executive Deluxe Room.
 * Demonstrates Polymorphism by overriding {@link Room#calculateTariff(int)}
 * with executive service amenities credit.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class DeluxeRoom extends Room {

    private static final double LUXURY_AMENITIES_SURCHARGE_PERCENT = 0.05; // 5% premium luxury amenities

    public DeluxeRoom() {
        super();
        setRoomType("DELUXE");
        setMaxOccupancy(3);
    }

    public DeluxeRoom(Long id, String roomNumber, double pricePerNight, String status, String description, String imageUrl) {
        super(id, roomNumber, "DELUXE", pricePerNight, status, 3, description, imageUrl);
    }

    /**
     * Polymorphic implementation of {@code calculateTariff}.
     * Incorporates base rate plus luxury amenities service surcharge.
     *
     * @param nights Number of nights of stay
     * @return Total room tariff including deluxe room amenities
     */
    @Override
    public double calculateTariff(int nights) {
        if (nights <= 0) {
            throw new IllegalArgumentException("Nights of stay must be at least 1.");
        }
        double baseTotal = getPricePerNight() * nights;
        double surcharge = baseTotal * LUXURY_AMENITIES_SURCHARGE_PERCENT;
        return Math.round((baseTotal + surcharge) * 100.0) / 100.0;
    }
}
