package com.hotel.model;

/**
 * Abstraction Interface representing any entity capable of generating a billable charge.
 * Demonstrates the Object-Oriented concept of Abstraction and Interface contracts.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public interface Billable {

    /**
     * Calculates total tariff based on number of stay nights.
     *
     * @param nights Number of nights for the stay
     * @return Calculated tariff amount before taxes
     */
    double calculateTariff(int nights);

    /**
     * Gets the base per-unit or per-night price.
     *
     * @return Base rate in currency units
     */
    double getBaseRate();

    /**
     * Provides a printable description for invoice generation.
     *
     * @return Line item description
     */
    String getBillingItemDescription();
}
