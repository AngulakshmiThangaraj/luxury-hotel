import React, { useEffect, useRef } from 'react';
import { Booking, Customer, Room } from '../types';

interface DashboardViewProps {
  rooms: Room[];
  bookings: Booking[];
  customers: Customer[];
  onNavigateTab: (tab: any) => void;
  onCheckInGuest: (bookingId: number) => void;
  onCheckoutGuest: (booking: Booking) => void;
}

declare global {
  interface Window {
    Chart?: any;
  }
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rooms,
  bookings,
  customers,
  onNavigateTab,
  onCheckInGuest,
  onCheckoutGuest,
}) => {
  const revenueChartRef = useRef<HTMLCanvasElement | null>(null);
  const occupancyChartRef = useRef<HTMLCanvasElement | null>(null);
  const revenueChartInstance = useRef<any>(null);
  const occupancyChartInstance = useRef<any>(null);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;

  const activeBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
  ).length;

  // Calculate total settled revenue + checked in bookings total
  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.status === 'CHECKED_OUT' || b.status === 'CHECKED_IN') {
      return sum + b.totalAmount;
    }
    return sum;
  }, 0);

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Today checkins (bookings with checkInDate = 2026-10-14 or confirmed status)
  const todayDateStr = '2026-10-14';
  const todayCheckins = bookings.filter(
    (b) => b.checkInDate === todayDateStr || (b.status === 'CONFIRMED' && b.checkInDate <= todayDateStr)
  );

  useEffect(() => {
    if (!window.Chart) return;

    // Monthly Revenue Bar Chart
    if (revenueChartRef.current) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }

      const ctx = revenueChartRef.current.getContext('2d');
      if (ctx) {
        revenueChartInstance.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Current)'],
            datasets: [
              {
                label: 'Monthly Revenue (₹)',
                data: [58000, 72500, 89400, 94200, 112000, Math.max(124000, totalRevenue)],
                backgroundColor: [
                  'rgba(108, 92, 231, 0.75)',
                  'rgba(108, 92, 231, 0.75)',
                  'rgba(108, 92, 231, 0.75)',
                  'rgba(108, 92, 231, 0.75)',
                  'rgba(108, 92, 231, 0.75)',
                  'rgba(0, 184, 148, 0.85)',
                ],
                borderRadius: 8,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: any) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(226, 232, 240, 0.6)' },
                ticks: {
                  callback: (value: any) => `₹${value / 1000}k`,
                },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        });
      }
    }

    // Occupancy Donut Chart
    if (occupancyChartRef.current) {
      if (occupancyChartInstance.current) {
        occupancyChartInstance.current.destroy();
      }

      const ctx = occupancyChartRef.current.getContext('2d');
      if (ctx) {
        occupancyChartInstance.current = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Available', 'Occupied', 'Maintenance'],
            datasets: [
              {
                data: [availableRooms, occupiedRooms, maintenanceRooms],
                backgroundColor: ['#00B894', '#E17055', '#FDCB6E'],
                borderWidth: 0,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  font: { family: 'Poppins', size: 11 },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (occupancyChartInstance.current) occupancyChartInstance.current.destroy();
    };
  }, [availableRooms, occupiedRooms, maintenanceRooms, totalRevenue]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Colourful Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Rooms - Purple Gradient */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] text-white shadow-lg shadow-[#6C5CE7]/20 hover-lift relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Inventory</p>
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{totalRooms}</h3>
              <p className="text-xs mt-2 opacity-80 flex items-center gap-1">
                <span>15 configured rooms in MySQL</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl text-white">
              <i className="fa-solid fa-hotel"></i>
            </div>
          </div>
        </div>

        {/* Available Rooms - Green/Teal Gradient */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#00B894] to-[#55efc4] text-white shadow-lg shadow-[#00B894]/20 hover-lift relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Available Rooms</p>
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{availableRooms}</h3>
              <p className="text-xs mt-2 opacity-80 flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-[10px]"></i>
                <span>Ready for instant check-in</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl text-white">
              <i className="fa-solid fa-door-open"></i>
            </div>
          </div>
        </div>

        {/* Active Bookings - Pink/Rose Gradient */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#FD79A8] to-[#fab1a0] text-white shadow-lg shadow-[#FD79A8]/20 hover-lift relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Active Bookings</p>
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{activeBookings}</h3>
              <p className="text-xs mt-2 opacity-80 flex items-center gap-1">
                <span>{occupiedRooms} in-house • {activeBookings - occupiedRooms} confirmed</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl text-white">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
          </div>
        </div>

        {/* Total Revenue - Blue Gradient */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0984E3] to-[#74b9ff] text-white shadow-lg shadow-[#0984E3]/20 hover-lift relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Revenue</p>
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-xs mt-2 opacity-80 flex items-center gap-1">
                <span>Includes room + 12% GST</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl text-white">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Chart.js Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-chart-column text-[#6C5CE7]"></i>
                <span>Monthly Hotel Revenue Trends</span>
              </h3>
              <p className="text-xs text-slate-400">Current fiscal year performance (INR)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#00B894] border border-emerald-200 dark:border-emerald-800">
              +18.4% MoM
            </span>
          </div>
          <div className="h-64 relative">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        {/* Room Occupancy Donut Chart (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-[#00B894]"></i>
                <span>Room Occupancy Status</span>
              </h3>
              <p className="text-xs text-slate-400">Current hotel capacity utilization</p>
            </div>
            <span className="text-xs font-bold text-[#6C5CE7]">{occupancyRate}% Occupied</span>
          </div>
          <div className="h-52 relative flex-1 flex items-center justify-center">
            <canvas ref={occupancyChartRef}></canvas>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Available</p>
              <p className="font-bold text-[#00B894]">{availableRooms}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Occupied</p>
              <p className="font-bold text-[#E17055]">{occupiedRooms}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Maintenance</p>
              <p className="font-bold text-[#FDCB6E]">{maintenanceRooms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Check-ins & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Check-ins Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-bell-concierge text-[#FD79A8]"></i>
                <span>Today's Guest Arrivals & Active Stays</span>
              </h3>
              <p className="text-xs text-slate-400">Scheduled check-ins and active in-house guests</p>
            </div>
            <button
              onClick={() => onNavigateTab('booking')}
              className="text-xs font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Bookings</span>
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Booking</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-[#6C5CE7]">#{b.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</p>
                      <p className="text-[10px] text-slate-400">{b.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Room {b.roomNumber}</span>
                      <span className="block text-[10px] text-slate-400">{b.roomType}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <span>{b.checkInDate}</span>
                      <span className="text-[10px] block text-slate-400">{b.totalNights} nights</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          b.status === 'CHECKED_IN'
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : b.status === 'CONFIRMED'
                            ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {b.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => onCheckInGuest(b.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#00B894] hover:bg-[#00a383] text-white font-semibold text-[11px] shadow-sm transition cursor-pointer"
                        >
                          Check In
                        </button>
                      ) : b.status === 'CHECKED_IN' ? (
                        <button
                          onClick={() => onCheckoutGuest(b)}
                          className="px-2.5 py-1 rounded-lg bg-[#FD79A8] hover:bg-[#fa6095] text-white font-semibold text-[11px] shadow-sm transition cursor-pointer"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Front Desk Quick Operations (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-[#6C5CE7]"></i>
              <span>Front Desk Quick Actions</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Instant shortcuts for high-frequency reception operations:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => onNavigateTab('booking')}
                className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-left transition cursor-pointer"
              >
                <p className="text-xs font-bold text-[#6C5CE7] flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar-plus text-[11px]"></i>
                  <span>New Guest Reservation</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Check live room availability, select dates, and assign rooms.
                </p>
              </button>

              <button
                onClick={() => onNavigateTab('customers')}
                className="w-full p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 text-left transition cursor-pointer"
              >
                <p className="text-xs font-bold text-[#00B894] flex items-center gap-1.5">
                  <i className="fa-solid fa-user-plus text-[11px]"></i>
                  <span>Register Customer Profile</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Add guest contact info, ID proof (Aadhaar/Passport), and preferences.
                </p>
              </button>

              <button
                onClick={() => onNavigateTab('billing')}
                className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40 text-left transition cursor-pointer"
              >
                <p className="text-xs font-bold text-[#b58117] dark:text-[#FDCB6E] flex items-center gap-1.5">
                  <i className="fa-solid fa-receipt text-[11px]"></i>
                  <span>Check-Out & Settle Bill</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Calculate room nights, add auxiliary services, 12% GST, and print invoice.
                </p>
              </button>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('rooms')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Manage Room Inventory</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
