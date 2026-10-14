package com.hotel.repository;

import com.hotel.model.BookingServiceDetail;
import com.hotel.model.ServiceItem;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

/**
 * Data access repository for hotel auxiliary services and guest service orders.
 */
@Repository
public class ServiceRepository {

    private final JdbcTemplate jdbcTemplate;

    public ServiceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final class ServiceRowMapper implements RowMapper<ServiceItem> {
        @Override
        public ServiceItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            ServiceItem s = new ServiceItem();
            s.setId(rs.getLong("id"));
            s.setServiceName(rs.getString("service_name"));
            s.setCategory(rs.getString("category"));
            s.setPrice(rs.getDouble("price"));
            s.setDescription(rs.getString("description"));
            return s;
        }
    }

    private static final class BookingServiceRowMapper implements RowMapper<BookingServiceDetail> {
        @Override
        public BookingServiceDetail mapRow(ResultSet rs, int rowNum) throws SQLException {
            BookingServiceDetail d = new BookingServiceDetail();
            d.setId(rs.getLong("id"));
            d.setBookingId(rs.getLong("booking_id"));
            d.setServiceId(rs.getLong("service_id"));
            d.setServiceName(rs.getString("service_name"));
            d.setServiceCategory(rs.getString("category"));
            d.setQuantity(rs.getInt("quantity"));
            d.setUnitPrice(rs.getDouble("unit_price"));
            d.setSubtotal(rs.getDouble("subtotal"));
            if (rs.getTimestamp("service_date") != null) {
                d.setServiceDate(rs.getTimestamp("service_date").toLocalDateTime());
            }
            return d;
        }
    }

    public List<ServiceItem> findAll() {
        String sql = "SELECT id, service_name, category, price, description FROM services ORDER BY category, service_name";
        return jdbcTemplate.query(sql, new ServiceRowMapper());
    }

    public Optional<ServiceItem> findById(Long id) {
        String sql = "SELECT id, service_name, category, price, description FROM services WHERE id = ?";
        try {
            ServiceItem s = jdbcTemplate.queryForObject(sql, new ServiceRowMapper(), id);
            return Optional.ofNullable(s);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<BookingServiceDetail> findByBookingId(Long bookingId) {
        String sql = "SELECT bs.id, bs.booking_id, bs.service_id, s.service_name, s.category, bs.quantity, bs.unit_price, bs.subtotal, bs.service_date " +
                     "FROM booking_services bs " +
                     "JOIN services s ON bs.service_id = s.id " +
                     "WHERE bs.booking_id = ? ORDER BY bs.id ASC";
        return jdbcTemplate.query(sql, new BookingServiceRowMapper(), bookingId);
    }

    public BookingServiceDetail addServiceToBooking(Long bookingId, Long serviceId, int quantity, double unitPrice) {
        double subtotal = Math.round(quantity * unitPrice * 100.0) / 100.0;
        String sql = "INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, bookingId);
            ps.setLong(2, serviceId);
            ps.setInt(3, quantity);
            ps.setDouble(4, unitPrice);
            ps.setDouble(5, subtotal);
            return ps;
        }, keyHolder);

        BookingServiceDetail detail = new BookingServiceDetail();
        if (keyHolder.getKey() != null) {
            detail.setId(keyHolder.getKey().longValue());
        }
        detail.setBookingId(bookingId);
        detail.setServiceId(serviceId);
        detail.setQuantity(quantity);
        detail.setUnitPrice(unitPrice);
        detail.setSubtotal(subtotal);
        return detail;
    }

    public double calculateServicesTotal(Long bookingId) {
        String sql = "SELECT COALESCE(SUM(subtotal), 0.0) FROM booking_services WHERE booking_id = ?";
        Double total = jdbcTemplate.queryForObject(sql, Double.class, bookingId);
        return total != null ? total : 0.0;
    }
}
