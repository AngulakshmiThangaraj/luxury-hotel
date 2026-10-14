package com.hotel.service;

import com.hotel.dto.RoomDTO;
import com.hotel.model.Room;

import java.util.List;
import java.util.Map;

/**
 * Service contract for Room lifecycle operations.
 */
public interface RoomService {

    List<Room> getAllRooms();

    List<Room> getAvailableRooms();

    Room getRoomById(Long id);

    Room getRoomByNumber(String roomNumber);

    Room createRoom(RoomDTO roomDTO);

    Room updateRoom(Long id, RoomDTO roomDTO);

    void updateRoomStatus(Long id, String status);

    void deleteRoom(Long id);

    /**
     * Demonstrates Collections and Stream API: Groups rooms count by room type.
     *
     * @return Map of Room Type -> Count
     */
    Map<String, Long> getRoomCountByType();
}
