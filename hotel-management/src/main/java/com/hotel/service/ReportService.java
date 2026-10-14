package com.hotel.service;

import com.hotel.dto.DashboardSummaryDTO;
import com.hotel.model.Booking;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

/**
 * Service contract for business analytics, dashboard KPIs, and tabular CSV file export.
 * Demonstrates Java File I/O using streams and writers.
 */
public interface ReportService {

    DashboardSummaryDTO getDashboardSummary();

    List<Booking> getTodayCheckins();

    /**
     * Demonstrates Java File I/O: Exports all booking records into CSV format.
     *
     * @param outputStream Target output stream for writing CSV bytes
     * @throws IOException If I/O error occurs
     */
    void exportBookingsToCsv(OutputStream outputStream) throws IOException;

    /**
     * Helper to return CSV as a raw String for REST controller direct download.
     */
    String generateBookingsCsvString();
}
