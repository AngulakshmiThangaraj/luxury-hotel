package com.hotel.service;

import com.hotel.dto.LoginRequest;
import com.hotel.dto.LoginResponse;

/**
 * Service interface for authentication and role verification.
 */
public interface AuthService {

    /**
     * Authenticates user against credentials in database.
     *
     * @param request Login credentials
     * @return Authenticated user profile and session token
     */
    LoginResponse authenticate(LoginRequest request);
}
