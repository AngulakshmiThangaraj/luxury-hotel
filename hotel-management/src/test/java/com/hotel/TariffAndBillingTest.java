package com.hotel;

import com.hotel.model.*;
import com.hotel.service.BookingService;
import com.hotel.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit 5 Unit Tests verifying Polymorphic Room Tariff calculation
 * and Method Overloading bill computation with 12% GST.
 */
class TariffAndBillingTest {

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        // Instantiate service without database mocks for pure mathematical business logic testing
        bookingService = new BookingServiceImpl(null, null, null, null, null);
    }

    @Test
    @DisplayName("Polymorphism: SingleRoom calculateTariff returns standard rate * nights")
    void testSingleRoomTariff() {
        Room singleRoom = new SingleRoom(1L, "101", 1800.00, "AVAILABLE", "Cozy single", null);
        double tariff = singleRoom.calculateTariff(3);
        assertEquals(5400.00, tariff, 0.001, "Single room for 3 nights @ 1800 should be 5400.00");
    }

    @Test
    @DisplayName("Polymorphism: DoubleRoom calculateTariff returns double occupancy rate * nights")
    void testDoubleRoomTariff() {
        Room doubleRoom = new DoubleRoom(2L, "201", 2800.00, "AVAILABLE", "Spacious double", null);
        double tariff = doubleRoom.calculateTariff(2);
        assertEquals(5600.00, tariff, 0.001, "Double room for 2 nights @ 2800 should be 5600.00");
    }

    @Test
    @DisplayName("Polymorphism: DeluxeRoom calculateTariff includes 5% luxury amenities service fee")
    void testDeluxeRoomTariff() {
        Room deluxeRoom = new DeluxeRoom(3L, "301", 4000.00, "AVAILABLE", "Luxury deluxe", null);
        // Base: 4000 * 2 = 8000. Surcharge (5%): 400. Total = 8400.00
        double tariff = deluxeRoom.calculateTariff(2);
        assertEquals(8400.00, tariff, 0.001, "Deluxe room should include 5% amenities surcharge");
    }

    @Test
    @DisplayName("Polymorphism: Suite calculateTariff includes 10% presidential concierge fee")
    void testSuiteTariff() {
        Room suite = new Suite(4L, "401", 8000.00, "AVAILABLE", "Presidential suite", null);
        // Base: 8000 * 1 = 8000. Surcharge (10%): 800. Total = 8800.00
        double tariff = suite.calculateTariff(1);
        assertEquals(8800.00, tariff, 0.001, "Suite should include 10% concierge fee");
    }

    @Test
    @DisplayName("Polymorphism: Method Overloading calculateBill(roomTariff) computes 12% GST")
    void testCalculateBillOverload1() {
        // Room tariff = 10000. GST @ 12% = 1200. Total = 11200.00
        double bill = bookingService.calculateBill(10000.00);
        assertEquals(11200.00, bill, 0.001);
    }

    @Test
    @DisplayName("Polymorphism: Method Overloading calculateBill(roomTariff, servicesTotal) computes subtotal + 12% GST")
    void testCalculateBillOverload2() {
        // Room tariff = 10000, Services = 2000. Subtotal = 12000. GST @ 12% = 1440. Total = 13440.00
        double bill = bookingService.calculateBill(10000.00, 2000.00);
        assertEquals(13440.00, bill, 0.001);
    }

    @Test
    @DisplayName("Polymorphism: Method Overloading calculateBill(roomTariff, servicesTotal, discount) applies discount then 12% GST")
    void testCalculateBillOverload3() {
        // Subtotal = 10000. Discount 10% = 9000. GST @ 12% = 1080. Total = 10080.00
        double bill = bookingService.calculateBill(8000.00, 2000.00, 10.0);
        assertEquals(10080.00, bill, 0.001);
    }

    @Test
    @DisplayName("Encapsulation & Validation: Negative nights throw IllegalArgumentException")
    void testInvalidNightsThrowsException() {
        Room room = new SingleRoom(1L, "101", 1800.00, "AVAILABLE", "Single", null);
        assertThrows(IllegalArgumentException.class, () -> room.calculateTariff(0));
        assertThrows(IllegalArgumentException.class, () -> room.calculateTariff(-2));
    }
}
