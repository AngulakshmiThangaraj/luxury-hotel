package com.hotel.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Model representing a Guest Room Booking transaction.
 * Demonstrates Aggregation/Composition with Customer, Room, and Services.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class Booking {

    private Long id;
    private Long customerId;
    private Long roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDate actualCheckoutDate;
    private int totalNights;
    private double roomCharge;
    private double servicesTotal;
    private double gstAmount;
    private double totalAmount;
    private String status; // CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
    private String notes;
    private LocalDateTime createdAt;

    // Associated Object References for Rich Representation
    private Customer customer;
    private Room room;
    private List<BookingServiceDetail> services = new ArrayList<>();

    public Booking() {
        this.status = "CONFIRMED";
        this.createdAt = LocalDateTime.now();
    }

    public Booking(Long id, Long customerId, Long roomId, LocalDate checkInDate, LocalDate checkOutDate,
                   int totalNights, double roomCharge, double servicesTotal, double gstAmount,
                   double totalAmount, String status, String notes) {
        this.id = id;
        this.customerId = customerId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalNights = totalNights;
        this.roomCharge = roomCharge;
        this.servicesTotal = servicesTotal;
        this.gstAmount = gstAmount;
        this.totalAmount = totalAmount;
        this.status = status;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public LocalDate getActualCheckoutDate() {
        return actualCheckoutDate;
    }

    public void setActualCheckoutDate(LocalDate actualCheckoutDate) {
        this.actualCheckoutDate = actualCheckoutDate;
    }

    public int getTotalNights() {
        return totalNights;
    }

    public void setTotalNights(int totalNights) {
        this.totalNights = totalNights;
    }

    public double getRoomCharge() {
        return roomCharge;
    }

    public void setRoomCharge(double roomCharge) {
        this.roomCharge = roomCharge;
    }

    public double getServicesTotal() {
        return servicesTotal;
    }

    public void setServicesTotal(double servicesTotal) {
        this.servicesTotal = servicesTotal;
    }

    public double getGstAmount() {
        return gstAmount;
    }

    public void setGstAmount(double gstAmount) {
        this.gstAmount = gstAmount;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public List<BookingServiceDetail> getServices() {
        return services;
    }

    public void setServices(List<BookingServiceDetail> services) {
        this.services = (services != null) ? services : new ArrayList<>();
    }
}
