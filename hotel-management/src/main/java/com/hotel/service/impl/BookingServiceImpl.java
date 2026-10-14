package com.hotel.service.impl;

import com.hotel.dto.BookingRequestDTO;
import com.hotel.dto.BookingResponseDTO;
import com.hotel.dto.CheckoutResponseDTO;
import com.hotel.exception.InvalidDateException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.exception.RoomNotAvailableException;
import com.hotel.model.*;
import com.hotel.repository.*;
import com.hotel.service.BookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for hotel reservations, checkout settlements, and billing.
 * Demonstrates:
 * - Polymorphism via Method Overloading (multiple {@code calculateBill} variants)
 * - Polymorphism via Method Overriding (calling {@code room.calculateTariff(nights)})
 * - Robust Exception Handling with try-catch-finally blocks
 * - Date and room conflict validations
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
@Service
public class BookingServiceImpl implements BookingService {

    private static final double GST_RATE = 0.12; // 12% GST as specified

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Constructor injection demonstrating Spring Dependency Injection.
     */
    public BookingServiceImpl(BookingRepository bookingRepository,
                              RoomRepository roomRepository,
                              CustomerRepository customerRepository,
                              ServiceRepository serviceRepository,
                              PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.serviceRepository = serviceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::enrichBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return enrichBookingResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        // Validation: Verify dates
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new InvalidDateException("Check-out date (" + request.getCheckOutDate() +
                    ") must be strictly after check-in date (" + request.getCheckInDate() + ").");
        }

        // Verify Customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        // Verify Room exists
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", request.getRoomId()));

        if ("MAINTENANCE".equalsIgnoreCase(room.getStatus())) {
            throw new RoomNotAvailableException("Room " + room.getRoomNumber() + " is currently under MAINTENANCE.");
        }

        // Check availability to prevent double booking
        checkAvailability(request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate(), null);

        // Calculate nights
        long daysBetween = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        int totalNights = (int) Math.max(1, daysBetween);

        // Polymorphism via Method Overriding:
        // room.calculateTariff() executes the subclass override (Single, Double, Deluxe, Suite)
        double roomTariff = room.calculateTariff(totalNights);

        // Polymorphism via Method Overloading:
        // calculateBill(roomTariff) computes initial bill with 12% GST
        double grandTotal = calculateBill(roomTariff);
        double gstAmount = Math.round((roomTariff * GST_RATE) * 100.0) / 100.0;

        Booking booking = new Booking();
        booking.setCustomerId(customer.getId());
        booking.setRoomId(room.getId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalNights(totalNights);
        booking.setRoomCharge(roomTariff);
        booking.setServicesTotal(0.00);
        booking.setGstAmount(gstAmount);
        booking.setTotalAmount(grandTotal);
        booking.setStatus("CONFIRMED");
        booking.setNotes(request.getNotes());

        // Demonstration of try-catch-finally in service layer
        boolean auditLogged = false;
        try {
            booking = bookingRepository.save(booking);

            // If check-in is today, set room status to OCCUPIED
            if (request.getCheckInDate().isEqual(LocalDate.now())) {
                roomRepository.updateStatus(room.getId(), "OCCUPIED");
                booking.setStatus("CHECKED_IN");
                bookingRepository.updateStatus(booking.getId(), "CHECKED_IN");
            }
            auditLogged = true;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to persist booking transaction: " + ex.getMessage(), ex);
        } finally {
            // finally block execution guaranteed
            if (!auditLogged) {
                System.err.println("[AUDIT ERROR] Booking reservation transaction rolled back.");
            }
        }

        return enrichBookingResponse(booking);
    }

    @Override
    public void checkAvailability(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(roomId, checkIn, checkOut, excludeBookingId);
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new RoomNotAvailableException(String.format(
                    "Room is already reserved from %s to %s (Booking #%d). Please select alternate dates or rooms.",
                    conflict.getCheckInDate(), conflict.getCheckOutDate(), conflict.getId()
            ));
        }
    }

    @Override
    @Transactional
    public void checkInGuest(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if ("CHECKED_IN".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException("Guest is already checked in for booking #" + bookingId);
        }
        if ("CHECKED_OUT".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException("Booking #" + bookingId + " has already been checked out.");
        }

        booking.setStatus("CHECKED_IN");
        bookingRepository.updateStatus(bookingId, "CHECKED_IN");
        roomRepository.updateStatus(booking.getRoomId(), "OCCUPIED");
    }

    @Override
    @Transactional
    public CheckoutResponseDTO checkoutGuest(Long bookingId, String paymentMode, String transactionRef) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if ("CHECKED_OUT".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException("Booking #" + bookingId + " has already been checked out.");
        }

        // Get room details
        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", booking.getRoomId()));

        Customer customer = customerRepository.findById(booking.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", booking.getCustomerId()));

        // Calculate auxiliary services total
        double servicesTotal = serviceRepository.calculateServicesTotal(bookingId);
        List<BookingServiceDetail> servicesList = serviceRepository.findByBookingId(bookingId);

        // Polymorphism via Method Overloading:
        // calculateBill(roomCharge, servicesTotal) computes room + services + 12% GST
        double grandTotal = calculateBill(booking.getRoomCharge(), servicesTotal);
        double subtotal = booking.getRoomCharge() + servicesTotal;
        double gstAmount = Math.round((subtotal * GST_RATE) * 100.0) / 100.0;

        LocalDate today = LocalDate.now();
        bookingRepository.completeCheckout(bookingId, today, servicesTotal, gstAmount, grandTotal);

        // Mark room status back to AVAILABLE
        roomRepository.updateStatus(room.getId(), "AVAILABLE");

        // Record payment settlement
        String txn = (transactionRef != null && !transactionRef.trim().isEmpty())
                ? transactionRef.trim()
                : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String mode = (paymentMode != null && !paymentMode.trim().isEmpty()) ? paymentMode.toUpperCase() : "CASH";

        Payment payment = new Payment(null, bookingId, grandTotal, mode, txn, "COMPLETED");
        paymentRepository.save(payment);

        // Prepare printable invoice response
        CheckoutResponseDTO response = new CheckoutResponseDTO();
        response.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%05d", bookingId));
        response.setBookingId(bookingId);
        response.setInvoiceDate(LocalDateTime.now());
        response.setCustomerName(customer.getName());
        response.setCustomerPhone(customer.getPhone());
        response.setCustomerEmail(customer.getEmail());
        response.setCustomerAddress(customer.getAddress());
        response.setCustomerIdProof(customer.getIdProof());
        response.setRoomNumber(room.getRoomNumber());
        response.setRoomType(room.getRoomType());
        response.setPricePerNight(room.getPricePerNight());
        response.setCheckInDate(booking.getCheckInDate());
        response.setCheckOutDate(today.isAfter(booking.getCheckInDate()) ? today : booking.getCheckOutDate());
        response.setTotalNights(booking.getTotalNights());
        response.setRoomCharge(booking.getRoomCharge());
        response.setServicesTotal(servicesTotal);
        response.setSubtotalBeforeGst(subtotal);
        response.setGstRatePercent(12.0);
        response.setGstAmount(gstAmount);
        response.setGrandTotal(grandTotal);
        response.setPaymentMode(mode);
        response.setTransactionRef(txn);
        response.setStatus("CHECKED_OUT");
        response.setServices(servicesList);

        return response;
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        booking.setStatus("CANCELLED");
        bookingRepository.updateStatus(bookingId, "CANCELLED");

        // Release room if it was reserved
        roomRepository.updateStatus(booking.getRoomId(), "AVAILABLE");
    }

    // ==============================================================
    // Polymorphism: Method Overloading Implementations
    // ==============================================================

    /**
     * Overload 1: Room tariff only.
     */
    @Override
    public double calculateBill(double roomTariff) {
        double gst = roomTariff * GST_RATE;
        return Math.round((roomTariff + gst) * 100.0) / 100.0;
    }

    /**
     * Overload 2: Room tariff + services total.
     */
    @Override
    public double calculateBill(double roomTariff, double servicesTotal) {
        double subtotal = roomTariff + servicesTotal;
        double gst = subtotal * GST_RATE;
        return Math.round((subtotal + gst) * 100.0) / 100.0;
    }

    /**
     * Overload 3: Room tariff + services total with promotional discount percentage.
     */
    @Override
    public double calculateBill(double roomTariff, double servicesTotal, double discountPercent) {
        double subtotal = roomTariff + servicesTotal;
        double discountAmount = (subtotal * (discountPercent / 100.0));
        double discountedSubtotal = Math.max(0.0, subtotal - discountAmount);
        double gst = discountedSubtotal * GST_RATE;
        return Math.round((discountedSubtotal + gst) * 100.0) / 100.0;
    }

    /**
     * Helper to assemble full {@link BookingResponseDTO} with joined customer and room details.
     */
    private BookingResponseDTO enrichBookingResponse(Booking b) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(b.getId());
        dto.setCustomerId(b.getCustomerId());
        dto.setRoomId(b.getRoomId());
        dto.setCheckInDate(b.getCheckInDate());
        dto.setCheckOutDate(b.getCheckOutDate());
        dto.setActualCheckoutDate(b.getActualCheckoutDate());
        dto.setTotalNights(b.getTotalNights());
        dto.setRoomCharge(b.getRoomCharge());
        dto.setServicesTotal(b.getServicesTotal());
        dto.setGstAmount(b.getGstAmount());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setStatus(b.getStatus());
        dto.setNotes(b.getNotes());
        dto.setCreatedAt(b.getCreatedAt());

        // Join customer
        customerRepository.findById(b.getCustomerId()).ifPresent(c -> {
            dto.setCustomerName(c.getName());
            dto.setCustomerPhone(c.getPhone());
            dto.setCustomerEmail(c.getEmail());
        });

        // Join room
        roomRepository.findById(b.getRoomId()).ifPresent(r -> {
            dto.setRoomNumber(r.getRoomNumber());
            dto.setRoomType(r.getRoomType());
            dto.setPricePerNight(r.getPricePerNight());
        });

        // Join services
        List<BookingServiceDetail> services = serviceRepository.findByBookingId(b.getId());
        dto.setServices(services);

        return dto;
    }
}
