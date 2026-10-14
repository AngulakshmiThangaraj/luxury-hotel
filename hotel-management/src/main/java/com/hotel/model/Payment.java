package com.hotel.model;

import java.time.LocalDateTime;

/**
 * Model representing a financial payment transaction for a hotel booking checkout.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class Payment {

    private Long id;
    private Long bookingId;
    private double amount;
    private String paymentMode; // CASH, CREDIT_CARD, UPI, NET_BANKING
    private String transactionRef;
    private LocalDateTime paymentDate;
    private String status;

    public Payment() {
        this.paymentDate = LocalDateTime.now();
        this.status = "COMPLETED";
    }

    public Payment(Long id, Long bookingId, double amount, String paymentMode, String transactionRef, String status) {
        this.id = id;
        this.bookingId = bookingId;
        this.amount = amount;
        this.paymentMode = paymentMode;
        this.transactionRef = transactionRef;
        this.paymentDate = LocalDateTime.now();
        this.status = (status != null) ? status : "COMPLETED";
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

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
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

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
