package com.hotel.service;

import com.hotel.dto.AddServiceRequestDTO;
import com.hotel.model.BookingServiceDetail;
import com.hotel.model.ServiceItem;

import java.util.List;

/**
 * Service interface for managing auxiliary guest services (Food, Laundry, Spa, etc.).
 */
public interface ServiceManagementService {

    List<ServiceItem> getAllAvailableServices();

    ServiceItem getServiceById(Long id);

    BookingServiceDetail addServiceToBooking(Long bookingId, AddServiceRequestDTO request);

    List<BookingServiceDetail> getServicesForBooking(Long bookingId);
}
