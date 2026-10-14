import React, { useState, useEffect } from 'react';
import { Customer, Invoice, Room, User, Booking } from './types';
import { INITIAL_BOOKINGS, INITIAL_CUSTOMERS, INITIAL_ROOMS, INITIAL_SERVICES } from './mockData';
import { calculateBill, calculateRoomTariff } from './services/hotelLogic';

// Subcomponents
import { LoginView } from './components/LoginView';
import { Sidebar, TabType } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { RoomsView } from './components/RoomsView';
import { CustomersView } from './components/CustomersView';
import { BookingView } from './components/BookingView';
import { BillingView } from './components/BillingView';
import { ServicesView } from './components/ServicesView';
import { ReportsView } from './components/ReportsView';
import { AIConciergeView } from './components/AIConciergeView';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // Current user session (null = login screen)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gh_hotel_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Entities state
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [services] = useState(INITIAL_SERVICES);

  // Preselected context states
  const [preselectedRoom, setPreselectedRoom] = useState<Room | null>(null);
  const [preselectedCustomer, setPreselectedCustomer] = useState<Customer | null>(null);
  const [preselectedBookingForService, setPreselectedBookingForService] = useState<Booking | null>(null);

  // Active Invoice for check-out display
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('gh_hotel_user', JSON.stringify(user));
    } catch {}
    if (user.authProvider === 'google') {
      addToast(`Signed in with Google as ${user.fullName} (${user.role})!`, 'success');
    } else {
      addToast(`Welcome back, ${user.fullName}!`, 'success');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('gh_hotel_user');
    } catch {}
    setCurrentTab('dashboard');
    addToast('You have been signed out securely.', 'info');
  };

  // Room Management Handlers
  const handleAddRoom = (newRoomData: Omit<Room, 'id'>) => {
    const newId = Math.max(...rooms.map((r) => r.id), 0) + 1;
    const room: Room = { ...newRoomData, id: newId };
    setRooms((prev) => [...prev, room]);
    addToast(`Room ${room.roomNumber} (${room.roomType}) added successfully!`, 'success');
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    addToast(`Room ${updatedRoom.roomNumber} updated successfully!`, 'success');
  };

  const handleDeleteRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    addToast(`Room ${room?.roomNumber || roomId} deleted from inventory.`, 'info');
  };

  const handleQuickBookRoom = (room: Room) => {
    setPreselectedRoom(room);
    setCurrentTab('booking');
  };

  // Customer Management Handlers
  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newId = Math.max(...customers.map((c) => c.id), 0) + 1;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addToast(`Guest ${newCustomer.name} registered successfully!`, 'success');
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    addToast(`Customer profile for ${updatedCustomer.name} updated.`, 'success');
  };

  const handleSelectCustomerForBooking = (customer: Customer) => {
    setPreselectedCustomer(customer);
    setCurrentTab('booking');
  };

  // Booking Handlers
  const handleCreateBooking = (data: {
    customerId: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    notes?: string;
  }) => {
    const room = rooms.find((r) => r.id === data.roomId);
    const customer = customers.find((c) => c.id === data.customerId);

    if (!room || !customer) return;

    const d1 = new Date(data.checkInDate);
    const d2 = new Date(data.checkOutDate);
    const nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));

    const roomTariff = calculateRoomTariff(room.roomType, room.pricePerNight, nights);
    const bill = calculateBill(roomTariff, 0);

    const isToday = data.checkInDate === '2026-10-14';
    const status = isToday ? 'CHECKED_IN' : 'CONFIRMED';

    const newBookingId = Math.max(...bookings.map((b) => b.id), 0) + 1;
    const newBooking: Booking = {
      id: newBookingId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      totalNights: nights,
      roomCharge: roomTariff,
      servicesTotal: 0,
      gstAmount: bill.gstAmount,
      totalAmount: bill.grandTotal,
      status: status,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      services: [],
    };

    setBookings((prev) => [newBooking, ...prev]);

    // If check-in is today, mark room as OCCUPIED
    if (isToday) {
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: 'OCCUPIED' } : r))
      );
      addToast(`Booking #${newBookingId} confirmed! Guest checked into Room ${room.roomNumber}.`, 'success');
    } else {
      addToast(`Booking #${newBookingId} reserved successfully for ${customer.name}!`, 'success');
    }
  };

  const handleCheckInGuest = (bookingId: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CHECKED_IN' } : b))
    );

    setRooms((prev) =>
      prev.map((r) => (r.id === booking.roomId ? { ...r, status: 'OCCUPIED' } : r))
    );

    addToast(`Guest ${booking.customerName} checked in to Room ${booking.roomNumber}!`, 'success');
  };

  const handleCancelBooking = (bookingId: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );

    // Release room if it was occupied
    setRooms((prev) =>
      prev.map((r) => (r.id === booking.roomId ? { ...r, status: 'AVAILABLE' } : r))
    );

    addToast(`Booking #${bookingId} has been cancelled. Room released.`, 'info');
  };

  // Add Service to Guest Tab
  const handleAddServiceToBooking = (bookingId: number, serviceId: number, quantity: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const service = services.find((s) => s.id === serviceId);

    if (!booking || !service) return;

    const subtotal = Math.round(service.price * quantity * 100) / 100;
    const newServiceItem = {
      id: Date.now(),
      bookingId,
      serviceId,
      serviceName: service.serviceName,
      serviceCategory: service.category,
      quantity,
      unitPrice: service.price,
      subtotal,
      serviceDate: new Date().toISOString(),
    };

    const updatedServices = [...booking.services, newServiceItem];
    const newServicesTotal = updatedServices.reduce((sum, s) => sum + s.subtotal, 0);

    // Overloaded calculateBill(roomCharge, servicesTotal)
    const bill = calculateBill(booking.roomCharge, newServicesTotal);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              services: updatedServices,
              servicesTotal: newServicesTotal,
              gstAmount: bill.gstAmount,
              totalAmount: bill.grandTotal,
            }
          : b
      )
    );

    addToast(`Added ${quantity}x ${service.serviceName} to Room ${booking.roomNumber}'s tab!`, 'success');
  };

  // Checkout and Generate Invoice
  const handlePerformCheckout = (
    bookingId: number,
    paymentMode: string,
    transactionRef: string = `TXN-${Date.now()}`
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const customer = customers.find((c) => c.id === booking.customerId);
    const room = rooms.find((r) => r.id === booking.roomId);

    const todayStr = '2026-10-14';

    // Mark booking as checked out
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'CHECKED_OUT', actualCheckoutDate: todayStr }
          : b
      )
    );

    // Release room back to AVAILABLE
    setRooms((prev) =>
      prev.map((r) => (r.id === booking.roomId ? { ...r, status: 'AVAILABLE' } : r))
    );

    const subtotal = booking.roomCharge + booking.servicesTotal;
    const bill = calculateBill(booking.roomCharge, booking.servicesTotal);

    // Build printable tax invoice
    const invoice: Invoice = {
      invoiceNumber: `INV-2026-${String(booking.id).padStart(5, '0')}`,
      bookingId: booking.id,
      invoiceDate: new Date().toISOString(),
      customerName: customer?.name || booking.customerName || 'Guest',
      customerPhone: customer?.phone || booking.customerPhone || 'N/A',
      customerEmail: customer?.email || booking.customerEmail || 'N/A',
      customerAddress: customer?.address || 'N/A',
      customerIdProof: customer?.idProof || 'AADHAAR-890123456789',
      roomNumber: room?.roomNumber || booking.roomNumber || '101',
      roomType: room?.roomType || booking.roomType || 'SINGLE',
      pricePerNight: room?.pricePerNight || booking.pricePerNight || 1800,
      checkInDate: booking.checkInDate,
      checkOutDate: todayStr,
      totalNights: booking.totalNights,
      roomCharge: booking.roomCharge,
      servicesTotal: booking.servicesTotal,
      subtotalBeforeGst: subtotal,
      gstRatePercent: 12.0,
      gstAmount: bill.gstAmount,
      grandTotal: bill.grandTotal,
      paymentMode: paymentMode || 'UPI',
      transactionRef: transactionRef || `TXN-${Date.now()}`,
      services: booking.services,
    };

    setActiveInvoice(invoice);
    addToast(`Checkout completed! Tax invoice generated for ${invoice.customerName}.`, 'success');
  };

  // If user is not logged in, render Login Hero View
  if (!currentUser) {
    return (
      <>
        <LoginView onLogin={handleLogin} />
        {/* Toast notifications */}
        <div className="fixed top-5 right-5 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md border animate-fadeIn ${
                t.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <i className={t.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'}></i>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-poppins antialiased selection:bg-[#6C5CE7] selection:text-white transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setPreselectedRoom(null);
          setPreselectedCustomer(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Topbar
          currentUser={currentUser}
          currentTab={currentTab}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNewBookingClick={() => {
            setPreselectedRoom(null);
            setPreselectedCustomer(null);
            setCurrentTab('booking');
          }}
          onOpenAIConcierge={() => setCurrentTab('ai-concierge')}
          onLogout={handleLogout}
        />

        {/* View Routing */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              rooms={rooms}
              bookings={bookings}
              customers={customers}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onCheckInGuest={handleCheckInGuest}
              onCheckoutGuest={(b) => {
                setCurrentTab('billing');
              }}
            />
          )}

          {currentTab === 'rooms' && (
            <RoomsView
              rooms={rooms}
              currentUser={currentUser}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onQuickBookRoom={handleQuickBookRoom}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onSelectCustomerForBooking={handleSelectCustomerForBooking}
            />
          )}

          {currentTab === 'booking' && (
            <BookingView
              rooms={rooms}
              customers={customers}
              bookings={bookings}
              onCreateBooking={handleCreateBooking}
              onCheckInGuest={handleCheckInGuest}
              onCheckoutGuest={(b) => {
                setCurrentTab('billing');
              }}
              onCancelBooking={handleCancelBooking}
              onOpenAddService={(b) => {
                setPreselectedBookingForService(b);
                setCurrentTab('services');
              }}
              preselectedRoom={preselectedRoom}
              preselectedCustomer={preselectedCustomer}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              bookings={bookings}
              onPerformCheckout={handlePerformCheckout}
              activeInvoice={activeInvoice}
              onCloseInvoice={() => setActiveInvoice(null)}
            />
          )}

          {currentTab === 'services' && (
            <ServicesView
              services={services}
              bookings={bookings}
              onAddServiceToBooking={handleAddServiceToBooking}
              preselectedBooking={preselectedBookingForService}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView rooms={rooms} bookings={bookings} />
          )}

          {currentTab === 'ai-concierge' && (
            <AIConciergeView currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md border animate-fadeIn ${
              t.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-700'
                : t.type === 'info'
                ? 'bg-indigo-50/95 border-indigo-200 text-indigo-700'
                : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
            }`}
          >
            <i
              className={
                t.type === 'error'
                  ? 'fa-solid fa-circle-exclamation text-rose-500'
                  : t.type === 'info'
                  ? 'fa-solid fa-circle-info text-indigo-500'
                  : 'fa-solid fa-circle-check text-emerald-500'
              }
            ></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
