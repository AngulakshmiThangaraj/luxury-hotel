package com.hotel.model;

/**
 * Entity representing an auxiliary hotel service (Food, Laundry, Spa, Airport Taxi, etc.).
 * Demonstrates Encapsulation and Data Integrity.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class ServiceItem {

    private Long id;
    private String serviceName;
    private String category;
    private double price;
    private String description;

    public ServiceItem() {
    }

    public ServiceItem(Long id, String serviceName, String category, double price, String description) {
        this.id = id;
        this.serviceName = serviceName;
        this.category = category;
        setPrice(price);
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        if (price < 0) {
            throw new IllegalArgumentException("Service price cannot be negative.");
        }
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
