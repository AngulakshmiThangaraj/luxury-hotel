package com.hotel.repository;

import com.hotel.model.Customer;
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
 * Repository for Customer persistence using {@link JdbcTemplate} with {@link RowMapper}.
 * Supports search by name or 10-digit phone number.
 */
@Repository
public class CustomerRepository {

    private final JdbcTemplate jdbcTemplate;

    public CustomerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final class CustomerRowMapper implements RowMapper<Customer> {
        @Override
        public Customer mapRow(ResultSet rs, int rowNum) throws SQLException {
            Customer c = new Customer();
            c.setId(rs.getLong("id"));
            c.setName(rs.getString("name"));
            c.setEmail(rs.getString("email"));
            c.setPhone(rs.getString("phone"));
            c.setIdProof(rs.getString("id_proof"));
            c.setAddress(rs.getString("address"));
            if (rs.getTimestamp("created_at") != null) {
                c.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            return c;
        }
    }

    public List<Customer> findAll() {
        String sql = "SELECT id, name, email, phone, id_proof, address, created_at FROM customers ORDER BY id DESC";
        return jdbcTemplate.query(sql, new CustomerRowMapper());
    }

    public Optional<Customer> findById(Long id) {
        String sql = "SELECT id, name, email, phone, id_proof, address, created_at FROM customers WHERE id = ?";
        try {
            Customer customer = jdbcTemplate.queryForObject(sql, new CustomerRowMapper(), id);
            return Optional.ofNullable(customer);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Customer> search(String query) {
        String sql = "SELECT id, name, email, phone, id_proof, address, created_at FROM customers " +
                     "WHERE LOWER(name) LIKE LOWER(?) OR phone LIKE ? ORDER BY name ASC";
        String wildcard = "%" + query.trim() + "%";
        return jdbcTemplate.query(sql, new CustomerRowMapper(), wildcard, wildcard);
    }

    public Customer save(Customer customer) {
        String sql = "INSERT INTO customers (name, email, phone, id_proof, address) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, customer.getName());
            ps.setString(2, customer.getEmail());
            ps.setString(3, customer.getPhone());
            ps.setString(4, customer.getIdProof());
            ps.setString(5, customer.getAddress());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            customer.setId(keyHolder.getKey().longValue());
        }
        return customer;
    }

    public boolean update(Customer customer) {
        String sql = "UPDATE customers SET name = ?, email = ?, phone = ?, id_proof = ?, address = ? WHERE id = ?";
        int updated = jdbcTemplate.update(sql,
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getIdProof(),
                customer.getAddress(),
                customer.getId());
        return updated > 0;
    }

    public boolean deleteById(Long id) {
        String sql = "DELETE FROM customers WHERE id = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }
}
