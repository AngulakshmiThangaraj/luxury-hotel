package com.hotel.exception;

/**
 * Custom runtime exception thrown when attempting to book an occupied room
 * or when dates conflict with an existing reservation (double booking prevention).
 */
public class RoomNotAvailableException extends RuntimeException {

    public RoomNotAvailableException(String message) {
        super(message);
    }
}
