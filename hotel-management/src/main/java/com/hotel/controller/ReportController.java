package com.hotel.controller;

import com.hotel.dto.DashboardSummaryDTO;
import com.hotel.model.Booking;
import com.hotel.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for analytics dashboards, occupancy reports, and CSV file exports.
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }

    @GetMapping("/today-checkins")
    public ResponseEntity<List<Booking>> getTodayCheckins() {
        return ResponseEntity.ok(reportService.getTodayCheckins());
    }

    @GetMapping("/export-csv")
    public ResponseEntity<String> exportBookingsToCsv() {
        String csvContent = reportService.generateBookingsCsvString();
        String filename = "hotel_bookings_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }
}
