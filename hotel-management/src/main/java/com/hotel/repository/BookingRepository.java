package com.hotel.repository;

import com.hotel.model.Booking;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Data access repository for Booking transactions using {@link JdbcTemplate}.
 * Enforces reservation isolation and prevents double bookings via date range queries.
 */
@Repository
public class BookingRepository {

    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final class BookingRowMapper implements RowMapper<Booking> {
        @Override
        public Booking mapRow(ResultSet rs, int rowNum) throws SQLException {
            Booking b = new Booking();
            b.setId(rs.getLong("id"));
            b.setCustomerId(rs.getLong("customer_id"));
            b.setRoomId(rs.getLong("room_id"));
            b.setCheckInDate(rs.getDate("check_in_date").toLocalDate());
            b.setCheckOutDate(rs.getDate("check_out_date").toLocalDate());
            if (rs.getDate("actual_checkout_date") != null) {
                b.setActualCheckoutDate(rs.getDate("actual_checkout_date").toLocalDate());
            }
            b.setTotalNights(rs.getInt("total_nights"));
            b.setRoomCharge(rs.getDouble("room_charge"));
            b.setServicesTotal(rs.getDouble("services_total"));
            b.setGstAmount(rs.getDouble("gst_amount"));
            b.setTotalAmount(rs.getDouble("total_amount"));
            b.setStatus(rs.getString("status"));
            b.setNotes(rs.getString("notes"));
            if (rs.getTimestamp("created_at") != null) {
                b.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            return b;
        }
    }

    public List<Booking> findAll() {
        String sql = "SELECT id, customer_id, room_id, check_in_date, check_out_date, actual_checkout_date, " +
                     "total_nights, room_charge, services_total, gst_amount, total_amount, status, notes, created_at " +
                     "FROM bookings ORDER BY id DESC";
        return jdbcTemplate.query(sql, new BookingRowMapper());
    }

    public Optional<Booking> findById(Long id) {
        String sql = "SELECT id, customer_id, room_id, check_in_date, check_out_date, actual_checkout_date, " +
                     "total_nights, room_charge, services_total, gst_amount, total_amount, status, notes, created_at " +
                     "FROM bookings WHERE id = ?";
        try {
            Booking booking = jdbcTemplate.queryForObject(sql, new BookingRowMapper(), id);
            return Optional.ofNullable(booking);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Prevents double bookings: Checks if there are overlapping active reservations for a given room.
     * Overlap condition: (existing.check_in < requested.check_out) AND (existing.check_out > requested.check_in)
     */
    public List<Booking> findConflictingBookings(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        String sql = "SELECT id, customer_id, room_id, check_in_date, check_out_date, actual_checkout_date, " +
                     "total_nights, room_charge, services_total, gst_amount, total_amount, status, notes, created_at " +
                     "FROM bookings " +
                     "WHERE room_id = ? " +
                     "AND status IN ('CONFIRMED', 'CHECKED_IN') " +
                     "AND check_in_date < ? " +
                     "AND check_out_date > ? " +
                     (excludeBookingId != null ? "AND id <> ? " : "");

        if (excludeBookingId != null) {
            return jdbcTemplate.query(sql, new BookingRowMapper(), roomId, Date.valueOf(checkOut), Date.valueOf(checkIn), excludeBookingId);
        } else {
            return jdbcTemplate.query(sql, new BookingRowMapper(), roomId, Date.valueOf(checkOut), Date.valueOf(checkIn));
        }
    }

    public List<Booking> findTodayCheckins(LocalDate today) {
        String sql = "SELECT id, customer_id, room_id, check_in_date, check_out_date, actual_checkout_date, " +
                     "total_nights, room_charge, services_total, gst_amount, total_amount, status, notes, created_at " +
                     "FROM bookings WHERE check_in_date = ? ORDER BY id ASC";
        return jdbcTemplate.query(sql, new BookingRowMapper(), Date.valueOf(today));
    }

    public List<Booking> findActiveBookings() {
        String sql = "SELECT id, customer_id, room_id, check_in_date, check_out_date, actual_checkout_date, " +
                     "total_nights, room_charge, services_total, gst_amount, total_amount, status, notes, created_at " +
                     "FROM bookings WHERE status IN ('CONFIRMED', 'CHECKED_IN') ORDER BY check_in_date ASC";
        return jdbcTemplate.query(sql, new BookingRowMapper());
    }

    public Booking save(Booking booking) {
        String sql = "INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_nights, " +
                     "room_charge, services_total, gst_amount, total_amount, status, notes) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, booking.getCustomerId());
            ps.setLong(2, booking.getRoomId());
            ps.setDate(3, Date.valueOf(booking.getCheckInDate()));
            ps.setDate(4, Date.valueOf(booking.getCheckOutDate()));
            ps.setInt(5, booking.getTotalNights());
            ps.setDouble(6, booking.getRoomCharge());
            ps.setDouble(7, booking.getServicesTotal());
            ps.setDouble(8, booking.getGstAmount());
            ps.setDouble(9, booking.getTotalAmount());
            ps.setString(10, booking.getStatus());
            ps.setString(11, booking.getNotes());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            booking.setId(keyHolder.getKey().longValue());
        }
        return booking;
    }

    public boolean updateStatus(Long bookingId, String status) {
        String sql = "UPDATE bookings SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status, bookingId) > 0;
    }

    public boolean updateBillingTotals(Long bookingId, double servicesTotal, double gstAmount, double totalAmount) {
        String sql = "UPDATE bookings SET services_total = ?, gst_amount = ?, total_amount = ? WHERE id = ?";
        return jdbcTemplate.update(sql, servicesTotal, gstAmount, totalAmount, bookingId) > 0;
    }

    public boolean completeCheckout(Long bookingId, LocalDate actualCheckoutDate, double servicesTotal, double gstAmount, double totalAmount) {
        String sql = "UPDATE bookings SET status = 'CHECKED_OUT', actual_checkout_date = ?, " +
                     "services_total = ?, gst_amount = ?, total_amount = ? WHERE id = ?";
        return jdbcTemplate.update(sql, Date.valueOf(actualCheckoutDate), servicesTotal, gstAmount, totalAmount, bookingId) > 0;
    }
}
