package com.hotel.repository;

import com.hotel.model.*;
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
 * Data access repository for Room persistence with polymorphic entity instantiation.
 * Constructs {@link SingleRoom}, {@link DoubleRoom}, {@link DeluxeRoom}, or {@link Suite}
 * dynamically based on the database column value.
 */
@Repository
public class RoomRepository {

    private final JdbcTemplate jdbcTemplate;

    public RoomRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final class RoomRowMapper implements RowMapper<Room> {
        @Override
        public Room mapRow(ResultSet rs, int rowNum) throws SQLException {
            String type = rs.getString("room_type");
            Long id = rs.getLong("id");
            String roomNumber = rs.getString("room_number");
            double price = rs.getDouble("price_per_night");
            String status = rs.getString("status");
            int maxOccupancy = rs.getInt("max_occupancy");
            String description = rs.getString("description");
            String imageUrl = rs.getString("image_url");

            // Polymorphic instantiation based on type hierarchy
            Room room;
            if ("SINGLE".equalsIgnoreCase(type)) {
                room = new SingleRoom(id, roomNumber, price, status, description, imageUrl);
            } else if ("DOUBLE".equalsIgnoreCase(type)) {
                room = new DoubleRoom(id, roomNumber, price, status, description, imageUrl);
            } else if ("DELUXE".equalsIgnoreCase(type)) {
                room = new DeluxeRoom(id, roomNumber, price, status, description, imageUrl);
            } else if ("SUITE".equalsIgnoreCase(type)) {
                room = new Suite(id, roomNumber, price, status, description, imageUrl);
            } else {
                room = new SingleRoom(id, roomNumber, price, status, description, imageUrl);
            }
            room.setMaxOccupancy(maxOccupancy);
            return room;
        }
    }

    public List<Room> findAll() {
        String sql = "SELECT id, room_number, room_type, price_per_night, status, max_occupancy, description, image_url " +
                     "FROM rooms ORDER BY room_number ASC";
        return jdbcTemplate.query(sql, new RoomRowMapper());
    }

    public List<Room> findByStatus(String status) {
        String sql = "SELECT id, room_number, room_type, price_per_night, status, max_occupancy, description, image_url " +
                     "FROM rooms WHERE status = ? ORDER BY room_number ASC";
        return jdbcTemplate.query(sql, new RoomRowMapper(), status);
    }

    public Optional<Room> findById(Long id) {
        String sql = "SELECT id, room_number, room_type, price_per_night, status, max_occupancy, description, image_url " +
                     "FROM rooms WHERE id = ?";
        try {
            Room room = jdbcTemplate.queryForObject(sql, new RoomRowMapper(), id);
            return Optional.ofNullable(room);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Room> findByRoomNumber(String roomNumber) {
        String sql = "SELECT id, room_number, room_type, price_per_night, status, max_occupancy, description, image_url " +
                     "FROM rooms WHERE room_number = ?";
        try {
            Room room = jdbcTemplate.queryForObject(sql, new RoomRowMapper(), roomNumber);
            return Optional.ofNullable(room);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Room save(Room room) {
        String sql = "INSERT INTO rooms (room_number, room_type, price_per_night, status, max_occupancy, description, image_url) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, room.getRoomNumber());
            ps.setString(2, room.getRoomType());
            ps.setDouble(3, room.getPricePerNight());
            ps.setString(4, room.getStatus());
            ps.setInt(5, room.getMaxOccupancy());
            ps.setString(6, room.getDescription());
            ps.setString(7, room.getImageUrl());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            room.setId(keyHolder.getKey().longValue());
        }
        return room;
    }

    public boolean update(Room room) {
        String sql = "UPDATE rooms SET room_number = ?, room_type = ?, price_per_night = ?, status = ?, " +
                     "max_occupancy = ?, description = ?, image_url = ? WHERE id = ?";
        int updated = jdbcTemplate.update(sql,
                room.getRoomNumber(),
                room.getRoomType(),
                room.getPricePerNight(),
                room.getStatus(),
                room.getMaxOccupancy(),
                room.getDescription(),
                room.getImageUrl(),
                room.getId());
        return updated > 0;
    }

    public boolean updateStatus(Long roomId, String status) {
        String sql = "UPDATE rooms SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status, roomId) > 0;
    }

    public boolean deleteById(Long id) {
        String sql = "DELETE FROM rooms WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }
}
