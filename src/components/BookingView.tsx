import React, { useState } from 'react';
import { Booking, Customer, Room } from '../types';
import { calculateBill, calculateRoomTariff, hasDateConflict } from '../services/hotelLogic';

interface BookingViewProps {
  rooms: Room[];
  customers: Customer[];
  bookings: Booking[];
  onCreateBooking: (bookingData: {
    customerId: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    notes?: string;
  }) => void;
  onCheckInGuest: (bookingId: number) => void;
  onCheckoutGuest: (booking: Booking) => void;
  onCancelBooking: (bookingId: number) => void;
  onOpenAddService: (booking: Booking) => void;
  preselectedRoom?: Room | null;
  preselectedCustomer?: Customer | null;
}

export const BookingView: React.FC<BookingViewProps> = ({
  rooms,
  customers,
  bookings,
  onCreateBooking,
  onCheckInGuest,
  onCheckoutGuest,
  onCancelBooking,
  onOpenAddService,
  preselectedRoom,
  preselectedCustomer,
}) => {
  // Booking Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    preselectedCustomer ? preselectedCustomer.id : customers[0]?.id || 1
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number>(
    preselectedRoom ? preselectedRoom.id : rooms.find((r) => r.status === 'AVAILABLE')?.id || rooms[0]?.id || 1
  );

  const todayStr = '2026-10-14';
  const defaultNextStr = '2026-10-17';

  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultNextStr);
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [bookingFilter, setBookingFilter] = useState<string>('ALL');

  // Selected room details
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Nights calculation
  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 1;
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();

  // Dynamic tariff & bill calculation
  const roomTariff = selectedRoom
    ? calculateRoomTariff(selectedRoom.roomType, selectedRoom.pricePerNight, nights)
    : 0;
  const billEstimate = calculateBill(roomTariff, 0);

  // Availability check
  const conflictCheck = hasDateConflict(selectedRoomId, checkInDate, checkOutDate, bookings);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (nights <= 0) {
      setFormError('Check-out date must be strictly after check-in date.');
      return;
    }

    if (conflictCheck.conflict && conflictCheck.conflictingBooking) {
      setFormError(
        `Room conflict: Room ${selectedRoom?.roomNumber} is already booked from ${conflictCheck.conflictingBooking.checkInDate} to ${conflictCheck.conflictingBooking.checkOutDate} (Booking #${conflictCheck.conflictingBooking.id}).`
      );
      return;
    }

    if (selectedRoom?.status === 'MAINTENANCE') {
      setFormError(`Room ${selectedRoom.roomNumber} is currently under maintenance.`);
      return;
    }

    onCreateBooking({
      customerId: selectedCustomerId,
      roomId: selectedRoomId,
      checkInDate,
      checkOutDate,
      notes: notes.trim(),
    });

    setNotes('');
  };

  // Filtered Bookings Table
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'ALL') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Reservation Form Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-calendar-plus text-[#FD79A8]"></i>
              <span>Create New Reservation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verify real-time availability, prevent double booking & calculate tariffs
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#6C5CE7] border border-purple-200 dark:border-purple-800">
            Automated 12% GST
          </span>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Select Customer */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Guest Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#FD79A8] focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Room */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Room Selection *
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#FD79A8] focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} - {r.roomType} (₹{r.pricePerNight}/night) [{r.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Check-In Date *
              </label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#FD79A8] focus:outline-none"
              />
            </div>

            {/* Check-Out Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Check-Out Date *
              </label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#FD79A8] focus:outline-none"
              />
            </div>
          </div>

          {/* Conflict Warning Alert */}
          {conflictCheck.conflict && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
              <span>
                <strong>Double-Booking Warning:</strong> Room {selectedRoom?.roomNumber} has an overlapping booking (#
                {conflictCheck.conflictingBooking?.id}) from {conflictCheck.conflictingBooking?.checkInDate} to{' '}
                {conflictCheck.conflictingBooking?.checkOutDate}. Choose different dates or another available room.
              </span>
            </div>
          )}

          {/* Real-time Tariff & Bill Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Total Stay</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{nights} Night(s)</p>
              </div>
              <div>
                <p className="text-slate-400">Polymorphic Tariff</p>
                <p className="font-bold text-[#6C5CE7]">
                  ₹{roomTariff.toLocaleString('en-IN')}{' '}
                  {selectedRoom?.roomType === 'DELUXE' && <span className="text-[10px] text-indigo-500">(+5%)</span>}
                  {selectedRoom?.roomType === 'SUITE' && <span className="text-[10px] text-purple-500">(+10%)</span>}
                </p>
              </div>
              <div>
                <p className="text-slate-400">GST (12%)</p>
                <p className="font-bold text-[#FD79A8]">₹{billEstimate.gstAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-slate-400">Estimated Total</p>
                <p className="font-bold text-emerald-600 text-sm">
                  ₹{billEstimate.grandTotal.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={conflictCheck.conflict || nights <= 0}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                conflictCheck.conflict || nights <= 0
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FD79A8] to-[#E17055] hover:opacity-95 text-white shadow-[#FD79A8]/30 active:scale-95'
              }`}
            >
              <i className="fa-solid fa-check"></i>
              <span>Confirm Reservation</span>
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">All Booking Reservations</h3>
            <p className="text-xs text-slate-400">Track in-house guests, check-ins, check-outs, and service tabs</p>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setBookingFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition cursor-pointer ${
                  bookingFilter === st
                    ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Dates & Nights</th>
                <th className="py-3 px-4">Room Tariff</th>
                <th className="py-3 px-4">Services</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-[#6C5CE7]">#{b.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</p>
                    <p className="text-[10px] text-slate-400">{b.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Room {b.roomNumber}</span>
                    <span className="block text-[10px] text-slate-400">{b.roomType}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <div>
                      {b.checkInDate} &rarr; {b.checkOutDate}
                    </div>
                    <span className="text-[10px] text-slate-400">{b.totalNights} nights</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">₹{b.roomCharge.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-emerald-600 font-medium">
                      ₹{b.servicesTotal.toLocaleString('en-IN')}
                    </span>
                    {b.services.length > 0 && (
                      <span className="block text-[10px] text-slate-400">({b.services.length} items)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-white">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'CHECKED_IN'
                          ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                          : b.status === 'CONFIRMED'
                          ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                          : b.status === 'CHECKED_OUT'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Check-In Action */}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => onCheckInGuest(b.id)}
                          title="Check-in guest & occupy room"
                          className="px-2 py-1 rounded bg-[#00B894] hover:bg-[#00a383] text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Check In
                        </button>
                      )}

                      {/* Add Service Button for Active Guest */}
                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => onOpenAddService(b)}
                          title="Attach auxiliary service (Food/Spa/Laundry)"
                          className="px-2 py-1 rounded bg-[#E17055] hover:bg-[#c95d43] text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          + Service
                        </button>
                      )}

                      {/* Check-Out Button */}
                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => onCheckoutGuest(b)}
                          title="Check out and settle invoice"
                          className="px-2 py-1 rounded bg-[#FD79A8] hover:bg-[#fa6095] text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Check Out
                        </button>
                      )}

                      {/* Cancel Action */}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel booking #${b.id}?`)) {
                              onCancelBooking(b.id);
                            }
                          }}
                          title="Cancel Booking"
                          className="w-7 h-7 rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 text-xs flex items-center justify-center transition cursor-pointer"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
