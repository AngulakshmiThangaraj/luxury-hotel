package com.hotel.Tariff;

import com.hotel.model.Customer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit 5 Unit Tests verifying Encapsulation validations on Person and Customer.
 */
class BookingValidationTest {

    @Test
    @DisplayName("Encapsulation: Customer valid phone and email setters succeed")
    void testValidCustomer() {
        Customer c = new Customer();
        assertDoesNotThrow(() -> {
            c.setName("Vikram Aditya");
            c.setEmail("vikram@example.com");
            c.setPhone("9876543210");
        });
        assertEquals("9876543210", c.getPhone());
    }

    @Test
    @DisplayName("Encapsulation: Invalid phone format throws IllegalArgumentException")
    void testInvalidPhoneThrows() {
        Customer c = new Customer();
        assertThrows(IllegalArgumentException.class, () -> c.setPhone("12345"));
        assertThrows(IllegalArgumentException.class, () -> c.setPhone("abc1234567"));
        assertThrows(IllegalArgumentException.class, () -> c.setPhone("9876543210123"));
    }

    @Test
    @DisplayName("Encapsulation: Invalid email format throws IllegalArgumentException")
    void testInvalidEmailThrows() {
        Customer c = new Customer();
        assertThrows(IllegalArgumentException.class, () -> c.setEmail("invalid-email-format"));
    }
}
