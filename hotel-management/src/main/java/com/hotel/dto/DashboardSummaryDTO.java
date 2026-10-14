package com.hotel.dto;

import java.util.Map;

/**
 * Data Transfer Object encapsulating high-level operational metrics and chart series for the dashboard.
 */
public class DashboardSummaryDTO {

    private int totalRooms;
    private int availableRooms;
    private int occupiedRooms;
    private int maintenanceRooms;
    private int activeBookings;
    private double totalRevenue;
    private int todayCheckins;
    private double occupancyRate;
    private Map<String, Integer> roomTypeDistribution;
    private Map<String, Double> monthlyRevenue;

    public DashboardSummaryDTO() {
    }

    public int getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(int totalRooms) {
        this.totalRooms = totalRooms;
    }

    public int getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(int availableRooms) {
        this.availableRooms = availableRooms;
    }

    public int getOccupiedRooms() {
        return occupiedRooms;
    }

    public void setOccupiedRooms(int occupiedRooms) {
        this.occupiedRooms = occupiedRooms;
    }

    public int getMaintenanceRooms() {
        return maintenanceRooms;
    }

    public void setMaintenanceRooms(int maintenanceRooms) {
        this.maintenanceRooms = maintenanceRooms;
    }

    public int getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(int activeBookings) {
        this.activeBookings = activeBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public int getTodayCheckins() {
        return todayCheckins;
    }

    public void setTodayCheckins(int todayCheckins) {
        this.todayCheckins = todayCheckins;
    }

    public double getOccupancyRate() {
        return occupancyRate;
    }

    public void setOccupancyRate(double occupancyRate) {
        this.occupancyRate = occupancyRate;
    }

    public Map<String, Integer> getRoomTypeDistribution() {
        return roomTypeDistribution;
    }

    public void setRoomTypeDistribution(Map<String, Integer> roomTypeDistribution) {
        this.roomTypeDistribution = roomTypeDistribution;
    }

    public Map<String, Double> getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(Map<String, Double> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }
}
