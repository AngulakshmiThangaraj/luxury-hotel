package com.hotel.controller;

import com.hotel.dto.AddServiceRequestDTO;
import com.hotel.model.BookingServiceDetail;
import com.hotel.model.ServiceItem;
import com.hotel.service.ServiceManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for hotel auxiliary services (Food, Laundry, Spa) and attaching them to guest stays.
 */
@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceManagementService serviceManagementService;

    public ServiceController(ServiceManagementService serviceManagementService) {
        this.serviceManagementService = serviceManagementService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceItem>> getAllServices() {
        return ResponseEntity.ok(serviceManagementService.getAllAvailableServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItem> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceManagementService.getServiceById(id));
    }

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<BookingServiceDetail> addServiceToBooking(@PathVariable Long bookingId,
                                                                   @Valid @RequestBody AddServiceRequestDTO request) {
        BookingServiceDetail detail = serviceManagementService.addServiceToBooking(bookingId, request);
        return new ResponseEntity<>(detail, HttpStatus.CREATED);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<BookingServiceDetail>> getServicesForBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(serviceManagementService.getServicesForBooking(bookingId));
    }
}
