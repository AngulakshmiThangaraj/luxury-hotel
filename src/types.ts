export type UserRole = 'ADMIN' | 'RECEPTIONIST';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
  authProvider?: 'local' | 'google';
}

export type RoomType = 'SINGLE' | 'DOUBLE' | 'DELUXE' | 'SUITE';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Room {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  maxOccupancy: number;
  description: string;
  imageUrl: string;
  amenities?: string[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  idProof: string;
  address: string;
  createdAt: string;
}

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface BookingServiceItem {
  id: number;
  bookingId: number;
  serviceId: number;
  serviceName: string;
  serviceCategory: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serviceDate: string;
}

export interface Booking {
  id: number;
  customerId: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  roomId: number;
  roomNumber?: string;
  roomType?: RoomType;
  pricePerNight?: number;
  checkInDate: string;
  checkOutDate: string;
  actualCheckoutDate?: string;
  totalNights: number;
  roomCharge: number;
  servicesTotal: number;
  gstAmount: number;
  totalAmount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  services: BookingServiceItem[];
}

export interface ServiceItem {
  id: number;
  serviceName: string;
  category: 'FOOD' | 'LAUNDRY' | 'SPA' | 'TRANSPORT';
  price: number;
  description: string;
}

export interface Invoice {
  invoiceNumber: string;
  bookingId: number;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerIdProof: string;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  roomCharge: number;
  servicesTotal: number;
  subtotalBeforeGst: number;
  gstRatePercent: number;
  gstAmount: number;
  grandTotal: number;
  paymentMode: string;
  transactionRef: string;
  services: BookingServiceItem[];
}
