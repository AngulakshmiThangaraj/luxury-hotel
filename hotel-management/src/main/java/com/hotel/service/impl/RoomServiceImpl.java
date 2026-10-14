package com.hotel.service.impl;

import com.hotel.dto.RoomDTO;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.model.*;
import com.hotel.repository.RoomRepository;
import com.hotel.service.RoomService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service implementation for Room domain logic.
 * Demonstrates Collections (List, Map) and Stream API for sorting and aggregation.
 */
@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    /**
     * Constructor injection demonstrating Spring DI.
     *
     * @param roomRepository Injected room repository
     */
    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public List<Room> getAllRooms() {
        // Stream API demonstration: Sort rooms by room number ascending
        return roomRepository.findAll().stream()
                .sorted(Comparator.comparing(Room::getRoomNumber))
                .collect(Collectors.toList());
    }

    @Override
    public List<Room> getAvailableRooms() {
        // Stream API demonstration: filter available rooms
        return roomRepository.findAll().stream()
                .filter(r -> "AVAILABLE".equalsIgnoreCase(r.getStatus()))
                .sorted(Comparator.comparing(Room::getPricePerNight))
                .collect(Collectors.toList());
    }

    @Override
    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
    }

    @Override
    public Room getRoomByNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomNumber", roomNumber));
    }

    @Override
    public Room createRoom(RoomDTO dto) {
        if (roomRepository.findByRoomNumber(dto.getRoomNumber()).isPresent()) {
            throw new IllegalArgumentException("Room with number " + dto.getRoomNumber() + " already exists.");
        }

        Room room = instantiateSubclass(dto);
        return roomRepository.save(room);
    }

    @Override
    public Room updateRoom(Long id, RoomDTO dto) {
        Room existing = getRoomById(id);
        existing.setRoomNumber(dto.getRoomNumber());
        existing.setRoomType(dto.getRoomType());
        existing.setPricePerNight(dto.getPricePerNight());
        existing.setStatus(dto.getStatus());
        existing.setMaxOccupancy(dto.getMaxOccupancy());
        existing.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null && !dto.getImageUrl().trim().isEmpty()) {
            existing.setImageUrl(dto.getImageUrl());
        }

        roomRepository.update(existing);
        return existing;
    }

    @Override
    public void updateRoomStatus(Long id, String status) {
        Room existing = getRoomById(id);
        existing.setStatus(status);
        roomRepository.updateStatus(id, status);
    }

    @Override
    public void deleteRoom(Long id) {
        getRoomById(id);
        roomRepository.deleteById(id);
    }

    @Override
    public Map<String, Long> getRoomCountByType() {
        // Stream API demonstration: Collectors.groupingBy and counting
        return roomRepository.findAll().stream()
                .collect(Collectors.groupingBy(Room::getRoomType, Collectors.counting()));
    }

    /**
     * Factory helper to instantiate concrete polymorphic subclasses of {@link Room}.
     */
    private Room instantiateSubclass(RoomDTO dto) {
        String type = dto.getRoomType().toUpperCase();
        Room room;
        switch (type) {
            case "SINGLE":
                room = new SingleRoom(null, dto.getRoomNumber(), dto.getPricePerNight(), dto.getStatus(), dto.getDescription(), dto.getImageUrl());
                break;
            case "DOUBLE":
                room = new DoubleRoom(null, dto.getRoomNumber(), dto.getPricePerNight(), dto.getStatus(), dto.getDescription(), dto.getImageUrl());
                break;
            case "DELUXE":
                room = new DeluxeRoom(null, dto.getRoomNumber(), dto.getPricePerNight(), dto.getStatus(), dto.getDescription(), dto.getImageUrl());
                break;
            case "SUITE":
                room = new Suite(null, dto.getRoomNumber(), dto.getPricePerNight(), dto.getStatus(), dto.getDescription(), dto.getImageUrl());
                break;
            default:
                room = new SingleRoom(null, dto.getRoomNumber(), dto.getPricePerNight(), dto.getStatus(), dto.getDescription(), dto.getImageUrl());
        }
        room.setMaxOccupancy(dto.getMaxOccupancy());
        return room;
    }
}
