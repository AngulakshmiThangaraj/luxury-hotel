package com.hotel.model;

import java.time.LocalDateTime;

/**
 * Model representing a service consumed by a guest during their stay.
 * Links a Booking with a ServiceItem, quantity, and timestamp.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class BookingServiceDetail {

    private Long id;
    private Long bookingId;
    private Long serviceId;
    private String serviceName;
    private String serviceCategory;
    private int quantity;
    private double unitPrice;
    private double subtotal;
    private LocalDateTime serviceDate;

    public BookingServiceDetail() {
    }

    public BookingServiceDetail(Long id, Long bookingId, Long serviceId, String serviceName,
                                String serviceCategory, int quantity, double unitPrice, LocalDateTime serviceDate) {
        this.id = id;
        this.bookingId = bookingId;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.serviceCategory = serviceCategory;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = Math.round(quantity * unitPrice * 100.0) / 100.0;
        this.serviceDate = (serviceDate != null) ? serviceDate : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1.");
        }
        this.quantity = quantity;
        this.subtotal = Math.round(this.quantity * this.unitPrice * 100.0) / 100.0;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
        this.subtotal = Math.round(this.quantity * this.unitPrice * 100.0) / 100.0;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public LocalDateTime getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDateTime serviceDate) {
        this.serviceDate = serviceDate;
    }
}
