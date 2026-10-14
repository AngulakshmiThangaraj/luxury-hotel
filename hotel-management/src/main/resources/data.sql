-- ==========================================================
-- Hotel Management System - Seed Data (MySQL 8)
-- Sample data: 2 users, 15 rooms, 10 customers, 5 services, bookings & payments
-- ==========================================================

-- 1. Users (Passwords hashed using BCrypt: admin123, rec123)
-- BCrypt hash for 'admin123': $2a$10$e88yv78xZgN8x4K8ZkVb3.8d2bL5wG0CjJcI0b0uY8G6c6f6e5e4q
-- BCrypt hash for 'rec123':   $2a$10$Q7yM5K3uX6xI1e1a5p6fZeL4h3r8j7y6k5x4w3v2u1t0s9r8q7p6o
INSERT INTO users (id, username, password_hash, full_name, role) VALUES
(1, 'admin', '$2a$10$e88yv78xZgN8x4K8ZkVb3.8d2bL5wG0CjJcI0b0uY8G6c6f6e5e4q', 'Vikram Malhotra (General Manager)', 'ADMIN'),
(2, 'reception', '$2a$10$Q7yM5K3uX6xI1e1a5p6fZeL4h3r8j7y6k5x4w3v2u1t0s9r8q7p6o', 'Ananya Sharma (Senior Receptionist)', 'RECEPTIONIST');

-- 2. Customers (10 Sample Customers)
INSERT INTO customers (id, name, email, phone, id_proof, address) VALUES
(1, 'Aarav Patel', 'aarav.patel@example.com', '9876543210', 'AADHAAR-890123456789', '42 MG Road, Bengaluru, Karnataka'),
(2, 'Priya Nair', 'priya.nair@example.com', '9823456781', 'PASSPORT-Z9876543', '15 Marine Drive, Mumbai, Maharashtra'),
(3, 'Rohan Verma', 'rohan.v@example.com', '9712345678', 'DRIVING-DL042018001', '88 Park Street, Kolkata, West Bengal'),
(4, 'Sneha Mukherjee', 'sneha.m@example.com', '9654321870', 'AADHAAR-765432109876', '12 Salt Lake Sector V, Kolkata'),
(5, 'Kabir Mehta', 'kabir.mehta@example.com', '9543216789', 'PASSPORT-P4532109', '7 Nehru Place, New Delhi'),
(6, 'Divya Sundaram', 'divya.s@example.com', '9432167890', 'AADHAAR-654321098765', '104 Anna Salai, Chennai, Tamil Nadu'),
(7, 'Arjun Deshmukh', 'arjun.d@example.com', '9321654987', 'VOTER-ABC1234567', '29 FC Road, Pune, Maharashtra'),
(8, 'Meera Kapoor', 'meera.k@example.com', '9210987654', 'PASSPORT-K8765432', '55 Banjara Hills, Hyderabad, Telangana'),
(9, 'Nikhil Joshi', 'nikhil.j@example.com', '9109876543', 'AADHAAR-543210987654', '18 Navrangpura, Ahmedabad, Gujarat'),
(10, 'Ishita Sengupta', 'ishita.s@example.com', '9012345678', 'AADHAAR-432109876543', '33 Civil Lines, Jaipur, Rajasthan');

-- 3. Rooms (15 Sample Rooms across Single, Double, Deluxe, Suite)
INSERT INTO rooms (id, room_number, room_type, price_per_night, status, max_occupancy, description, image_url) VALUES
(1, '101', 'SINGLE', 1800.00, 'AVAILABLE', 1, 'Cozy single room with ergonomic work desk and garden view.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'),
(2, '102', 'SINGLE', 1800.00, 'OCCUPIED', 1, 'Comfortable single room, high-speed Wi-Fi, modern shower.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'),
(3, '103', 'SINGLE', 1900.00, 'AVAILABLE', 1, 'Quiet single room facing courtyard with plush single bed.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'),
(4, '201', 'DOUBLE', 2800.00, 'OCCUPIED', 2, 'Spacious double bed room with private balcony and minibar.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'),
(5, '202', 'DOUBLE', 2800.00, 'AVAILABLE', 2, 'Contemporary twin/double bed with ambient warm lighting.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'),
(6, '203', 'DOUBLE', 2900.00, 'AVAILABLE', 2, 'Double room overlooking city skyline with coffee station.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'),
(7, '204', 'DOUBLE', 2800.00, 'MAINTENANCE', 2, 'Double room undergoing air-conditioner scheduled servicing.', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'),
(8, '301', 'DELUXE', 4500.00, 'OCCUPIED', 3, 'Luxury deluxe room with king-size bed and Italian marble bath.', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'),
(9, '302', 'DELUXE', 4500.00, 'AVAILABLE', 3, 'Deluxe sea-facing room with complimentary breakfast service.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'),
(10, '303', 'DELUXE', 4700.00, 'AVAILABLE', 3, 'Executive deluxe room with premium sound system and lounge.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'),
(11, '304', 'DELUXE', 4500.00, 'MAINTENANCE', 3, 'Deluxe suite being repainted for high-season readiness.', 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80'),
(12, '401', 'SUITE', 8500.00, 'OCCUPIED', 4, 'Presidential suite with private Jacuzzi, dining room & terrace.', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'),
(13, '402', 'SUITE', 8500.00, 'AVAILABLE', 4, 'Royal panoramic suite featuring bespoke concierge service.', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'),
(14, '403', 'SUITE', 9200.00, 'AVAILABLE', 4, 'Grand Penthouse suite with infinity pool deck access.', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'),
(15, '104', 'SINGLE', 1850.00, 'AVAILABLE', 1, 'Standard single business room with ultra-fast optical fiber.', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80');

-- 4. Services (Food, Laundry, Spa, etc.)
INSERT INTO services (id, service_name, category, price, description) VALUES
(1, 'Buffet Breakfast & High Tea', 'FOOD', 450.00, 'Lavish multi-cuisine buffet breakfast and evening tea/snacks.'),
(2, 'Gourmet In-Room Dining Dinner', 'FOOD', 950.00, 'Three-course chef signature dinner served in your room.'),
(3, 'Express Laundry & Dry Clean', 'LAUNDRY', 350.00, 'Same-day professional washing, pressing, and dry cleaning.'),
(4, 'Ayurvedic Rejuvenation Spa (60 min)', 'SPA', 1800.00, 'Full body aromatic herbal therapy by certified therapists.'),
(5, 'Airport Luxury Sedan Transfer', 'TRANSPORT', 1200.00, 'Private air-conditioned pickup or drop to international airport.');

-- 5. Bookings (Past, Active, and Upcoming)
INSERT INTO bookings (id, customer_id, room_id, check_in_date, check_out_date, actual_checkout_date, total_nights, room_charge, services_total, gst_amount, total_amount, status, notes) VALUES
(1, 1, 2, '2026-10-10', '2026-10-15', NULL, 5, 9000.00, 800.00, 1176.00, 10976.00, 'CHECKED_IN', 'Guest requested extra pillows and late check-in.'),
(2, 2, 4, '2026-10-12', '2026-10-16', NULL, 4, 11200.00, 2150.00, 1602.00, 14952.00, 'CHECKED_IN', 'Honeymoon couple, complimentary welcome drink provided.'),
(3, 3, 8, '2026-10-13', '2026-10-18', NULL, 5, 22500.00, 3600.00, 3132.00, 29232.00, 'CHECKED_IN', 'Corporate conference attendee, company bill back requested.'),
(4, 5, 12, '2026-10-11', '2026-10-16', NULL, 5, 42500.00, 3000.00, 5460.00, 50960.00, 'CHECKED_IN', 'VIP Suite reservation with airport pickup included.'),
(5, 4, 1, '2026-10-01', '2026-10-04', '2026-10-04', 3, 5400.00, 700.00, 732.00, 6832.00, 'CHECKED_OUT', 'Settled via credit card on check-out.'),
(6, 6, 5, '2026-10-02', '2026-10-06', '2026-10-06', 4, 11200.00, 1400.00, 1512.00, 14112.00, 'CHECKED_OUT', 'Smooth stay, guest left positive 5-star review.'),
(7, 7, 9, '2026-10-05', '2026-10-08', '2026-10-08', 3, 13500.00, 1800.00, 1836.00, 17136.00, 'CHECKED_OUT', 'Paid full via UPI.'),
(8, 8, 13, '2026-10-16', '2026-10-20', NULL, 4, 34000.00, 0.00, 4080.00, 38080.00, 'CONFIRMED', 'Advance booked online. Arrival scheduled at 2:00 PM.');

-- 6. Booking Services (Attached service add-ons)
INSERT INTO booking_services (id, booking_id, service_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 450.00, 450.00),
(2, 1, 3, 1, 350.00, 350.00),
(3, 2, 3, 1, 350.00, 350.00),
(4, 2, 4, 1, 1800.00, 1800.00),
(5, 3, 4, 2, 1800.00, 3600.00),
(6, 4, 5, 1, 1200.00, 1200.00),
(7, 4, 4, 1, 1800.00, 1800.00),
(8, 5, 3, 2, 350.00, 700.00),
(9, 6, 1, 2, 450.00, 900.00),
(10, 7, 4, 1, 1800.00, 1800.00);

-- 7. Payments
INSERT INTO payments (id, booking_id, amount, payment_mode, transaction_ref, status) VALUES
(1, 5, 6832.00, 'CREDIT_CARD', 'TXN-CC-998811', 'COMPLETED'),
(2, 6, 14112.00, 'NET_BANKING', 'TXN-NB-443322', 'COMPLETED'),
(3, 7, 17136.00, 'UPI', 'UPI-IND-778899', 'COMPLETED'),
(4, 8, 10000.00, 'CREDIT_CARD', 'TXN-CC-112233', 'COMPLETED');
