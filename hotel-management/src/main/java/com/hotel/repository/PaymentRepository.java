package com.hotel.repository;

import com.hotel.model.Payment;
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

/**
 * Data access repository for payments and checkout settlements.
 */
@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final class PaymentRowMapper implements RowMapper<Payment> {
        @Override
        public Payment mapRow(ResultSet rs, int rowNum) throws SQLException {
            Payment p = new Payment();
            p.setId(rs.getLong("id"));
            p.setBookingId(rs.getLong("booking_id"));
            p.setAmount(rs.getDouble("amount"));
            p.setPaymentMode(rs.getString("payment_mode"));
            p.setTransactionRef(rs.getString("transaction_ref"));
            if (rs.getTimestamp("payment_date") != null) {
                p.setPaymentDate(rs.getTimestamp("payment_date").toLocalDateTime());
            }
            p.setStatus(rs.getString("status"));
            return p;
        }
    }

    public Payment save(Payment payment) {
        String sql = "INSERT INTO payments (booking_id, amount, payment_mode, transaction_ref, status) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, payment.getBookingId());
            ps.setDouble(2, payment.getAmount());
            ps.setString(3, payment.getPaymentMode());
            ps.setString(4, payment.getTransactionRef());
            ps.setString(5, payment.getStatus());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            payment.setId(keyHolder.getKey().longValue());
        }
        return payment;
    }

    public List<Payment> findByBookingId(Long bookingId) {
        String sql = "SELECT id, booking_id, amount, payment_mode, transaction_ref, payment_date, status FROM payments WHERE booking_id = ?";
        return jdbcTemplate.query(sql, new PaymentRowMapper(), bookingId);
    }

    public double calculateTotalRevenue() {
        String sql = "SELECT COALESCE(SUM(amount), 0.0) FROM payments WHERE status = 'COMPLETED'";
        Double rev = jdbcTemplate.queryForObject(sql, Double.class);
        return rev != null ? rev : 0.0;
    }
}
