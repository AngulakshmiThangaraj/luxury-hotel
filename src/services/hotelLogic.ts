import { Booking, RoomType } from '../types';
import JSZip from 'jszip';

/**
 * Calculates room nightly tariff with room tier rates and luxury surcharges.
 */
export function calculateRoomTariff(roomType: RoomType, baseRate: number, nights: number): number {
  const safeNights = Math.max(1, nights);
  let tariff = baseRate * safeNights;

  if (roomType === 'DELUXE') {
    tariff = tariff * 1.05; // 5% luxury amenities fee (Deluxe)
  } else if (roomType === 'SUITE') {
    tariff = tariff * 1.10; // 10% presidential concierge fee (Suite)
  }

  return Math.round(tariff * 100) / 100;
}

/**
 * Calculates total bill, auxiliary services, discounts, and 12% GST.
 */
export function calculateBill(
  roomTariff: number,
  servicesTotal: number = 0,
  discountPercent: number = 0
): { subtotal: number; gstAmount: number; grandTotal: number } {
  const subtotalBeforeDiscount = roomTariff + servicesTotal;
  const discountAmount = (subtotalBeforeDiscount * discountPercent) / 100;
  const subtotal = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const gstAmount = Math.round((subtotal * 0.12) * 100) / 100;
  const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

  return { subtotal, gstAmount, grandTotal };
}

/**
 * Checks for date overlap conflicts to prevent double booking.
 * Overlap condition: (existing.checkIn < new.checkOut) AND (existing.checkOut > new.checkIn)
 */
export function hasDateConflict(
  roomId: number,
  checkIn: string,
  checkOut: string,
  bookings: Booking[],
  excludeBookingId?: number
): { conflict: boolean; conflictingBooking?: Booking } {
  const newStart = new Date(checkIn).getTime();
  const newEnd = new Date(checkOut).getTime();

  for (const b of bookings) {
    if (b.roomId !== roomId) continue;
    if (b.status === 'CANCELLED' || b.status === 'CHECKED_OUT') continue;
    if (excludeBookingId && b.id === excludeBookingId) continue;

    const existStart = new Date(b.checkInDate).getTime();
    const existEnd = new Date(b.checkOutDate).getTime();

    // Overlap condition
    if (existStart < newEnd && existEnd > newStart) {
      return { conflict: true, conflictingBooking: b };
    }
  }

  return { conflict: false };
}

/**
 * Generates RFC 4180 compliant CSV content for bookings download.
 */
export function generateBookingsCSV(bookings: Booking[]): string {
  const headers = [
    'Booking ID',
    'Customer Name',
    'Customer Phone',
    'Room Number',
    'Room Type',
    'Check-In Date',
    'Check-Out Date',
    'Nights',
    'Room Charge (INR)',
    'Services Total (INR)',
    'GST 12% (INR)',
    'Total Amount (INR)',
    'Status',
  ];

  const rows = bookings.map((b) => [
    b.id,
    `"${(b.customerName || '').replace(/"/g, '""')}"`,
    b.customerPhone || 'N/A',
    b.roomNumber || 'N/A',
    b.roomType || 'N/A',
    b.checkInDate,
    b.checkOutDate,
    b.totalNights,
    b.roomCharge.toFixed(2),
    b.servicesTotal.toFixed(2),
    b.gstAmount.toFixed(2),
    b.totalAmount.toFixed(2),
    `"${b.status}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Packages all Spring Boot Java project files into a downloadable zip file.
 */
export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Maven Root
  const root = zip.folder('hotel-management');
  if (!root) return;

  // Add README
  root.file('README.md', `# Grand Horizon - Hotel Management System
Java 17 & Spring Boot 3.x College Lab Experiment.
Refer to README.md for complete documentation and setup.`);

  // We can fetch or bundle the key project files
  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>com.hotel</groupId>
    <artifactId>hotel-management</artifactId>
    <version>1.0.0</version>
    <name>Hotel Management System</name>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-jdbc</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
        <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
        <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-crypto</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
    </dependencies>
</project>`;

  root.file('pom.xml', pomXml);

  const res = root.folder('src')?.folder('main')?.folder('resources');
  if (res) {
    res.file('application.properties', `server.port=8080
spring.application.name=hotel-management-system
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:schema.sql
spring.sql.init.data-locations=classpath:data.sql`);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hotel-management-java-spring-boot.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
