package com.hotel.service;

import com.hotel.dto.BookingRequestDTO;
import com.hotel.dto.BookingResponseDTO;
import com.hotel.dto.CheckoutResponseDTO;
import com.hotel.model.Booking;

import java.time.LocalDate;
import java.util.List;

/**
 * Service contract for Hotel Bookings, Availability Checking, Tariff Computation, and Checkout.
 * Demonstrates Polymorphism via Method Overloading in bill calculation contracts.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public interface BookingService {

    List<BookingResponseDTO> getAllBookings();

    BookingResponseDTO getBookingById(Long id);

    BookingResponseDTO createBooking(BookingRequestDTO request);

    void checkAvailability(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId);

    void checkInGuest(Long bookingId);

    CheckoutResponseDTO checkoutGuest(Long bookingId, String paymentMode, String transactionRef);

    void cancelBooking(Long bookingId);

    // ==============================================================
    // Polymorphism: Method Overloading for Bill Calculations
    // ==============================================================

    /**
     * Overload 1: Calculates grand total with 12% GST for room tariff only.
     *
     * @param roomTariff Total room tariff
     * @return Final amount including 12% GST
     */
    double calculateBill(double roomTariff);

    /**
     * Overload 2: Calculates grand total with 12% GST for room tariff + auxiliary services.
     *
     * @param roomTariff    Total room tariff
     * @param servicesTotal Auxiliary services total
     * @return Final amount including 12% GST
     */
    double calculateBill(double roomTariff, double servicesTotal);

    /**
     * Overload 3: Calculates grand total with promotional discount percentage and 12% GST.
     *
     * @param roomTariff      Total room tariff
     * @param servicesTotal   Auxiliary services total
     * @param discountPercent Promotional discount percentage (e.g. 5.0 for 5%)
     * @return Final discounted amount including 12% GST
     */
    double calculateBill(double roomTariff, double servicesTotal, double discountPercent);
}
