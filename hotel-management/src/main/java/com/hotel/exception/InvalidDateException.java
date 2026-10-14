package com.hotel.exception;

/**
 * Custom runtime exception thrown when reservation dates are semantically invalid
 * (e.g., check-out date is before or equal to check-in date).
 */
public class InvalidDateException extends RuntimeException {

    public InvalidDateException(String message) {
        super(message);
    }
}
