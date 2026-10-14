# Grand Horizon - Hotel Management System
## College Lab Experiment: "Implement the given use case using various Object-Oriented concepts in Java"

---

## 1. Lab Record Documentation

### Aim
To design, implement, and validate an enterprise-grade **Hotel Management System (HMS)** using Java 17 and Spring Boot 3.x, applying foundational and advanced Object-Oriented Programming (OOP) concepts—including **Inheritance, Encapsulation, Polymorphism (Overriding & Overloading), Abstraction, Interface Contracts, Dependency Injection, Collections Framework, Exception Handling, File I/O, and Bean Validation**—backed by a MySQL 8 relational database accessed via Spring `JdbcTemplate`.

### Procedure
1. **Domain Modeling & OOP Abstraction**: Formulated the `Billable` interface and defined the abstract base class `Room` along with polymorphic subclasses (`SingleRoom`, `DoubleRoom`, `DeluxeRoom`, `Suite`). Implemented `Person` as an abstract superclass extended by `Customer` and `Employee`.
2. **Encapsulation & Validation**: Encapsulated class properties with private access modifiers, enforcing business constraints (e.g., 10-digit mobile number, positive rates, date ordering) via setters and JSR-380 annotations.
3. **Database Architecture**: Designed a normalized 3NF MySQL schema (`schema.sql`) and populated comprehensive sample records (`data.sql`) across rooms, customers, users, services, bookings, and payments.
4. **Data Access Layer**: Constructed repositories utilizing Spring `JdbcTemplate` with custom `RowMapper` implementations and parameterized SQL queries to safeguard against SQL Injection vulnerabilities.
5. **Service Layer & Polymorphic Calculations**:
   - Overrode `calculateTariff(int nights)` across room tiers.
   - Overloaded `calculateBill(...)` to compute room tariffs, auxiliary services, and 12% GST.
   - Guarded operations using custom checked/runtime exceptions (`RoomNotAvailableException`, `InvalidDateException`, `ResourceNotFoundException`) and `try-catch-finally` blocks.
6. **RESTful Controller Layer**: Built `@RestController` endpoints with `@Valid` payload checking and centralized error reporting using `@RestControllerAdvice`.
7. **Reporting & File I/O**: Implemented dynamic CSV export utilizing Java Streams and `PrintWriter` for reporting.
8. **Testing & Verification**: Validated tariff polymorphism and bill formulas using JUnit 5 unit tests.

### Conclusion
The Hotel Management System was successfully engineered and verified. All core OOP tenets were practically demonstrated in a clean layered architecture (`Controller -> Service -> Repository -> MySQL`). Double-booking prevention, automated 12% GST computation, auxiliary services ledger, and printable invoice generation functioned according to specifications.

---

## 2. Object-Oriented Programming (OOP) Mapping Table

| OOP Concept | Java Class / Interface | Concrete Implementation & Demonstration |
| :--- | :--- | :--- |
| **Abstraction** | `com.hotel.model.Billable` | Defines abstract contract (`calculateTariff`, `getBaseRate`, `getBillingItemDescription`) implemented by billable assets. |
| **Inheritance** | `com.hotel.model.Person` -> `Customer`, `Employee` | Reusable demographic attributes (`name`, `email`, `phone`) inherited by guest and staff entities. |
| **Inheritance** | `com.hotel.model.Room` -> `SingleRoom`, `DoubleRoom`, `DeluxeRoom`, `Suite` | Common hotel room characteristics inherited; specialized attributes extended per tier. |
| **Encapsulation** | `com.hotel.model.Person`, `Room`, `Customer` | Private fields with public getters/setters validating inputs (e.g., 10-digit phone regex check, price > 0). |
| **Polymorphism (Overriding)** | `Room.calculateTariff(int nights)` | Subclasses override tariff logic: Single (1.0x), Double (1.0x), Deluxe (+5% amenities), Suite (+10% butler concierge). |
| **Polymorphism (Overloading)** | `BookingService.calculateBill(...)` | Three method overloads: `calculateBill(tariff)`, `calculateBill(tariff, services)`, `calculateBill(tariff, services, discount)`. |
| **Interfaces & DI** | `BookingService`, `RoomService`, `CustomerService` | Decoupled service contracts injected into Spring `@RestController` and services via constructor injection. |
| **Collections & Streams** | `com.hotel.service.impl.ReportServiceImpl` | `List`, `Map`, `Collectors.groupingBy()`, `Collectors.counting()`, and `.stream().filter()` for analytics. |
| **Exception Handling** | `RoomNotAvailableException`, `InvalidDateException`, `ResourceNotFoundException` | Custom runtime exceptions caught via `@RestControllerAdvice` (`GlobalExceptionHandler`) and `try-catch-finally`. |
| **File I/O** | `com.hotel.service.impl.ReportServiceImpl` | `PrintWriter`, `StringWriter`, and `OutputStream` to generate formatted CSV export downloads. |
| **Bean Validation** | `CustomerDTO`, `BookingRequestDTO`, `RoomDTO` | `@NotBlank`, `@Email`, `@Pattern`, `@FutureOrPresent`, `@DecimalMin`, `@Min` annotations. |

---

## 3. REST API Specifications

| Method | Endpoint | Description | Request Body / Params | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate Admin / Receptionist | `LoginRequest` (username, password) | `200 OK` / `400` |
| `GET` | `/api/rooms` | Retrieve all hotel rooms | None | `200 OK` |
| `GET` | `/api/rooms/available` | Filter rooms with status AVAILABLE | None | `200 OK` |
| `POST` | `/api/rooms` | Add a new hotel room | `RoomDTO` | `201 Created` |
| `PUT` | `/api/rooms/{id}` | Update room information | `RoomDTO` | `200 OK` |
| `PATCH` | `/api/rooms/{id}/status`| Update status (AVAILABLE, OCCUPIED, MAINTENANCE)| `{"status": "..."}` | `200 OK` |
| `DELETE`| `/api/rooms/{id}` | Delete room by ID | None | `200 OK` |
| `GET` | `/api/customers` | Retrieve all registered guests | None | `200 OK` |
| `GET` | `/api/customers/search` | Search guests by name or phone | `?query=Aarav` | `200 OK` |
| `POST` | `/api/customers` | Register a new guest | `CustomerDTO` | `201 Created` |
| `GET` | `/api/bookings` | List all booking records | None | `200 OK` |
| `POST` | `/api/bookings` | Create reservation (prevents double-booking) | `BookingRequestDTO` | `201 Created` / `409` |
| `POST` | `/api/bookings/{id}/check-in` | Mark guest as checked-in, room as OCCUPIED | None | `200 OK` |
| `POST` | `/api/bookings/{id}/check-out`| Finalize bill, apply 12% GST, return invoice | `{"paymentMode":"UPI"}` | `200 OK` |
| `POST` | `/api/bookings/{id}/cancel` | Cancel booking and release room | None | `200 OK` |
| `GET` | `/api/services` | List auxiliary hotel services catalog | None | `200 OK` |
| `POST` | `/api/services/booking/{id}` | Attach service (Food/Laundry/Spa) to booking | `AddServiceRequestDTO` | `201 Created` |
| `GET` | `/api/reports/dashboard` | Fetch dashboard stats, occupancy, revenue | None | `200 OK` |
| `GET` | `/api/reports/export-csv` | Download CSV spreadsheet of all bookings | None | `200 OK (text/csv)` |

---

## 4. Sample Test Cases Table

| Test ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Admin Authentication | Username: `admin`, Password: `admin123` | HTTP 200 with role `ADMIN` and token | HTTP 200 with role `ADMIN` and token | **PASS** |
| **TC-02** | Invalid Phone Validation | Phone: `98765` (less than 10 digits) | HTTP 400 Bad Request: "Phone number must be exactly 10 digits" | HTTP 400 Bad Request with field error | **PASS** |
| **TC-03** | Date Sequence Check | Check-In: `2026-10-20`, Check-Out: `2026-10-18` | HTTP 400: "Check-out date must be strictly after check-in date" | HTTP 400 InvalidDateException | **PASS** |
| **TC-04** | Double Booking Prevention | Overlapping reservation for Room 102 | HTTP 409 Conflict: "Room is already reserved for specified dates" | HTTP 409 RoomNotAvailableException | **PASS** |
| **TC-05** | Deluxe Room Tariff Override | 2 nights @ Deluxe rate ₹4,000/night | Base: 8000 + 5% luxury fee = ₹8,400.00 | ₹8,400.00 computed via `DeluxeRoom` | **PASS** |
| **TC-06** | Method Overload Bill Calc | Tariff ₹10,000 + Services ₹2,000 + 12% GST | Subtotal ₹12,000 + 12% (₹1,440) = ₹13,440.00 | Grand Total: ₹13,440.00 | **PASS** |
| **TC-07** | Auxiliary Service Addition | Booking #1 + 1x Ayurvedic Spa (₹1,800) | Service attached, total recalculated | Service appended and total updated | **PASS** |
| **TC-08** | CSV Report Export | Request `/api/reports/export-csv` | Streamed `hotel_bookings.csv` attachment | CSV file downloaded with RFC 4180 format | **PASS** |

---

## 5. Local Setup & Execution Instructions

### Prerequisites
1. **JDK 17 or higher** installed (`java -version`).
2. **Apache Maven 3.8+** installed (`mvn -version`).
3. **MySQL Server 8.0+** running on `localhost:3306`.

### Step 1: Database Creation
Log in to your MySQL terminal and create the database:
```sql
CREATE DATABASE hotel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Credentials
Edit `src/main/resources/application.properties` to match your local MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3: Run the Application
In your terminal, navigate to the `hotel-management` root directory and execute:
```bash
mvn clean spring-boot:run
```
Spring Boot will automatically execute `schema.sql` and `data.sql` to initialize tables and sample data.

### Step 4: Access the System
Open your web browser and navigate to:
**http://localhost:8080**

- **Admin Login**: `admin` / `admin123`
- **Receptionist Login**: `reception` / `rec123`
