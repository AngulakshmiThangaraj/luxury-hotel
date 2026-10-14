package com.hotel.model;

/**
 * Concrete Room subclass representing a Royal/Presidential Suite.
 * Demonstrates Polymorphism by overriding {@link Room#calculateTariff(int)}
 * with dedicated butler and concierge service valuation.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class Suite extends Room {

    private static final double BUTLER_SERVICE_SURCHARGE_PERCENT = 0.10; // 10% premium suite butler concierge fee

    public Suite() {
        super();
        setRoomType("SUITE");
        setMaxOccupancy(4);
    }

    public Suite(Long id, String roomNumber, double pricePerNight, String status, String description, String imageUrl) {
        super(id, roomNumber, "SUITE", pricePerNight, status, 4, description, imageUrl);
    }

    /**
     * Polymorphic implementation of {@code calculateTariff}.
     * Incorporates base rate plus presidential concierge/butler service fee.
     *
     * @param nights Number of nights of stay
     * @return Total room tariff including suite privileges
     */
    @Override
    public double calculateTariff(int nights) {
        if (nights <= 0) {
            throw new IllegalArgumentException("Nights of stay must be at least 1.");
        }
        double baseTotal = getPricePerNight() * nights;
        double suitePremium = baseTotal * BUTLER_SERVICE_SURCHARGE_PERCENT;
        return Math.round((baseTotal + suitePremium) * 100.0) / 100.0;
    }
}
