package com.hotel.dto;

import com.hotel.model.BookingServiceDetail;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object containing the full itemized billing breakdown for check-out and invoice printing.
 */
public class CheckoutResponseDTO {

    private String invoiceNumber;
    private Long bookingId;
    private LocalDateTime invoiceDate;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;
    private String customerIdProof;
    private String roomNumber;
    private String roomType;
    private Double pricePerNight;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer totalNights;
    private Double roomCharge;
    private Double servicesTotal;
    private Double subtotalBeforeGst;
    private Double gstRatePercent;
    private Double gstAmount;
    private Double grandTotal;
    private String paymentMode;
    private String transactionRef;
    private String status;
    private List<BookingServiceDetail> services;

    public CheckoutResponseDTO() {
        this.gstRatePercent = 12.0;
        this.invoiceDate = LocalDateTime.now();
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDateTime invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public String getCustomerIdProof() {
        return customerIdProof;
    }

    public void setCustomerIdProof(String customerIdProof) {
        this.customerIdProof = customerIdProof;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(Double pricePerNight) {
        this.pricePerNight = pricePerNight;
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

    public Integer getTotalNights() {
        return totalNights;
    }

    public void setTotalNights(Integer totalNights) {
        this.totalNights = totalNights;
    }

    public Double getRoomCharge() {
        return roomCharge;
    }

    public void setRoomCharge(Double roomCharge) {
        this.roomCharge = roomCharge;
    }

    public Double getServicesTotal() {
        return servicesTotal;
    }

    public void setServicesTotal(Double servicesTotal) {
        this.servicesTotal = servicesTotal;
    }

    public Double getSubtotalBeforeGst() {
        return subtotalBeforeGst;
    }

    public void setSubtotalBeforeGst(Double subtotalBeforeGst) {
        this.subtotalBeforeGst = subtotalBeforeGst;
    }

    public Double getGstRatePercent() {
        return gstRatePercent;
    }

    public void setGstRatePercent(Double gstRatePercent) {
        this.gstRatePercent = gstRatePercent;
    }

    public Double getGstAmount() {
        return gstAmount;
    }

    public void setGstAmount(Double gstAmount) {
        this.gstAmount = gstAmount;
    }

    public Double getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(Double grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<BookingServiceDetail> getServices() {
        return services;
    }

    public void setServices(List<BookingServiceDetail> services) {
        this.services = services;
    }
}
