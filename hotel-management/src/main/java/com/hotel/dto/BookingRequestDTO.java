package com.hotel.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Data Transfer Object for creating a new room booking reservation.
 */
public class BookingRequestDTO {

    @NotNull(message = "Customer ID is required.")
    private Long customerId;

    @NotNull(message = "Room ID is required.")
    private Long roomId;

    @NotNull(message = "Check-in date is required.")
    @FutureOrPresent(message = "Check-in date must be today or in the future.")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required.")
    private LocalDate checkOutDate;

    private String notes;

    public BookingRequestDTO() {
    }

    public BookingRequestDTO(Long customerId, Long roomId, LocalDate checkInDate, LocalDate checkOutDate, String notes) {
        this.customerId = customerId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.notes = notes;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
