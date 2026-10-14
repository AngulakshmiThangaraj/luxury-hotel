package com.hotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot Main Application Entry Point.
 *
 * College Lab Experiment:
 * "Implement the given use case using various Object-Oriented concepts in Java"
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
@SpringBootApplication
public class HotelManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(HotelManagementApplication.class, args);
        System.out.println("==================================================================");
        System.out.println(" Grand Horizon Hotel Management System is running on port 8080!  ");
        System.out.println(" Access Web UI at: http://localhost:8080                          ");
        System.out.println("==================================================================");
    }
}
