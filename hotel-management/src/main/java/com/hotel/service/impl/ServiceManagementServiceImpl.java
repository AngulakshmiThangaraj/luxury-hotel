package com.hotel.service.impl;

import com.hotel.dto.AddServiceRequestDTO;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.model.Booking;
import com.hotel.model.BookingServiceDetail;
import com.hotel.model.ServiceItem;
import com.hotel.repository.BookingRepository;
import com.hotel.repository.ServiceRepository;
import com.hotel.service.BookingService;
import com.hotel.service.ServiceManagementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link ServiceManagementService} for service item catalog and order tracking.
 */
@Service
public class ServiceManagementServiceImpl implements ServiceManagementService {

    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public ServiceManagementServiceImpl(ServiceRepository serviceRepository,
                                        BookingRepository bookingRepository,
                                        BookingService bookingService) {
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    @Override
    public List<ServiceItem> getAllAvailableServices() {
        return serviceRepository.findAll();
    }

    @Override
    public ServiceItem getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceItem", "id", id));
    }

    @Override
    @Transactional
    public BookingServiceDetail addServiceToBooking(Long bookingId, AddServiceRequestDTO request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if ("CHECKED_OUT".equalsIgnoreCase(booking.getStatus()) || "CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException("Cannot attach services to a " + booking.getStatus() + " booking.");
        }

        ServiceItem serviceItem = getServiceById(request.getServiceId());

        BookingServiceDetail detail = serviceRepository.addServiceToBooking(
                bookingId,
                serviceItem.getId(),
                request.getQuantity(),
                serviceItem.getPrice()
        );
        detail.setServiceName(serviceItem.getServiceName());
        detail.setServiceCategory(serviceItem.getCategory());

        // Recalculate totals
        double newServicesTotal = serviceRepository.calculateServicesTotal(bookingId);
        double grandTotal = bookingService.calculateBill(booking.getRoomCharge(), newServicesTotal);
        double gstAmount = Math.round(((booking.getRoomCharge() + newServicesTotal) * 0.12) * 100.0) / 100.0;

        bookingRepository.updateBillingTotals(bookingId, newServicesTotal, gstAmount, grandTotal);

        return detail;
    }

    @Override
    public List<BookingServiceDetail> getServicesForBooking(Long bookingId) {
        return serviceRepository.findByBookingId(bookingId);
    }
}
