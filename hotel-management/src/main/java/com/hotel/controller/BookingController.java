package com.hotel.controller;

import com.hotel.dto.BookingRequestDTO;
import com.hotel.dto.BookingResponseDTO;
import com.hotel.dto.CheckoutResponseDTO;
import com.hotel.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for reservation lifecycle: create, check-in, checkout, bill generation, and cancellation.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        BookingResponseDTO created = bookingService.createBooking(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<Map<String, String>> checkInGuest(@PathVariable Long id) {
        bookingService.checkInGuest(id);
        return ResponseEntity.ok(Map.of("message", "Guest checked in successfully. Room marked as OCCUPIED."));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<CheckoutResponseDTO> checkOutGuest(@PathVariable Long id,
                                                            @RequestBody(required = false) Map<String, String> payload) {
        String paymentMode = (payload != null) ? payload.get("paymentMode") : "CASH";
        String transactionRef = (payload != null) ? payload.get("transactionRef") : null;

        CheckoutResponseDTO invoice = bookingService.checkoutGuest(id, paymentMode, transactionRef);
        return ResponseEntity.ok(invoice);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking #" + id + " cancelled. Room marked as AVAILABLE."));
    }
}
