import React from 'react';
import { Booking, Room } from '../types';
import { generateBookingsCSV } from '../services/hotelLogic';

interface ReportsViewProps {
  rooms: Room[];
  bookings: Booking[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ rooms, bookings }) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

  const todayStr = '2026-10-14';
  const todayCheckins = bookings.filter((b) => b.checkInDate === todayStr);

  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.status === 'CHECKED_OUT' || b.status === 'CHECKED_IN') {
      return sum + b.totalAmount;
    }
    return sum;
  }, 0);

  const totalGstCollected = bookings.reduce((sum, b) => {
    if (b.status === 'CHECKED_OUT' || b.status === 'CHECKED_IN') {
      return sum + b.gstAmount;
    }
    return sum;
  }, 0);

  const handleExportCSV = () => {
    const csvContent = generateBookingsCSV(bookings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hotel_bookings_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Export CSV Action */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-[#a29bfe]"></i>
            <span>Operations & Financial Reports</span>
          </h2>
          <p className="text-xs text-slate-400">
            Occupancy rate KPIs, daily check-in logs, GST tax liability, and CSV spreadsheet export
          </p>
        </div>

        {/* Export Bookings to CSV Button */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#55efc4] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#00B894]/30 transition cursor-pointer active:scale-95"
        >
          <i className="fa-solid fa-file-csv text-base"></i>
          <span>Export Bookings to CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy Rate</p>
          <h3 className="text-2xl font-extrabold text-[#6C5CE7] mt-1">{occupancyRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">{occupiedRooms} of {totalRooms} rooms occupied</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Check-ins</p>
          <h3 className="text-2xl font-extrabold text-[#00B894] mt-1">{todayCheckins.length}</h3>
          <p className="text-xs text-slate-500 mt-1">Arrivals scheduled for {todayStr}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-2xl font-extrabold text-[#0984E3] mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-500 mt-1">Room charges + auxiliary services</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">12% GST Tax Collected</p>
          <h3 className="text-2xl font-extrabold text-[#FD79A8] mt-1">₹{totalGstCollected.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-500 mt-1">CGST (6%) + SGST (6%) statutory tax</p>
        </div>
      </div>

      {/* Today's Check-ins Detailed Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-clipboard-user text-[#00B894]"></i>
            <span>Today's Check-in Schedule ({todayStr})</span>
          </h3>
          <span className="text-xs text-slate-400">{todayCheckins.length} Scheduled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Booking ID</th>
                <th className="py-2.5 px-4">Guest Name</th>
                <th className="py-2.5 px-4">Phone</th>
                <th className="py-2.5 px-4">Room Number</th>
                <th className="py-2.5 px-4">Room Tier</th>
                <th className="py-2.5 px-4">Duration</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {todayCheckins.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-bold text-[#6C5CE7]">#{b.id}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{b.customerPhone}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">Room {b.roomNumber}</td>
                  <td className="py-2.5 px-4 text-slate-500">{b.roomType}</td>
                  <td className="py-2.5 px-4 text-slate-500">{b.totalNights} Night(s)</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'CHECKED_IN'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}

              {todayCheckins.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No scheduled arrivals for today's date ({todayStr}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
