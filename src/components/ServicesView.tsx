import React, { useState } from 'react';
import { Booking, ServiceItem } from '../types';

interface ServicesViewProps {
  services: ServiceItem[];
  bookings: Booking[];
  onAddServiceToBooking: (bookingId: number, serviceId: number, quantity: number) => void;
  preselectedBooking?: Booking | null;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  bookings,
  onAddServiceToBooking,
  preselectedBooking,
}) => {
  const activeBookings = bookings.filter((b) => b.status === 'CHECKED_IN');

  const [selectedBookingId, setSelectedBookingId] = useState<number>(
    preselectedBooking?.id || activeBookings[0]?.id || 1
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 1);
  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTabCategory, setActiveTabCategory] = useState<string>('ALL');

  const openOrderModal = (serviceId?: number) => {
    if (serviceId) setSelectedServiceId(serviceId);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !selectedServiceId || quantity < 1) return;

    onAddServiceToBooking(selectedBookingId, selectedServiceId, quantity);
    setIsModalOpen(false);
  };

  const filteredServices = services.filter((s) => {
    if (activeTabCategory === 'ALL') return true;
    return s.category === activeTabCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return 'fa-utensils text-[#FD79A8]';
      case 'LAUNDRY':
        return 'fa-shirt text-[#0984E3]';
      case 'SPA':
        return 'fa-spa text-[#00B894]';
      case 'TRANSPORT':
        return 'fa-car text-[#6C5CE7]';
      default:
        return 'fa-concierge-bell text-amber-500';
    }
  };

  // Compile all attached services across bookings for the ledger view
  const allAttachedServices = bookings.flatMap((b) =>
    b.services.map((s) => ({
      ...s,
      customerName: b.customerName,
      roomNumber: b.roomNumber,
      bookingStatus: b.status,
    }))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Category Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-concierge-bell text-[#E17055]"></i>
            <span>Hotel Auxiliary Guest Services</span>
          </h2>
          <p className="text-xs text-slate-400">
            Order in-room dining, laundry dry cleaning, spa wellness, and transfers for active guests
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          {['ALL', 'FOOD', 'LAUNDRY', 'SPA', 'TRANSPORT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTabCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
                activeTabCategory === cat
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                  <i className={`fa-solid ${getCategoryIcon(service.category)}`}></i>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {service.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-800 dark:text-white">{service.serviceName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                {service.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Unit Price</span>
                <p className="text-base font-bold text-slate-800 dark:text-white font-mono">
                  ₹{service.price.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => openOrderModal(service.id)}
                disabled={activeBookings.length === 0}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                  activeBookings.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#E17055] to-[#ff7675] hover:opacity-95 text-white shadow-[#E17055]/30'
                }`}
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Add to Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Services Ledger Table across Bookings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Auxiliary Services Ledger</h3>
          <span className="text-xs text-slate-400">{allAttachedServices.length} Total Services Charged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Service Item</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Guest & Room</th>
                <th className="py-2.5 px-4 text-center">Quantity</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
                <th className="py-2.5 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {allAttachedServices.slice(0, 8).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {item.serviceName}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.serviceCategory}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{item.customerName}</span>
                    <span className="text-[10px] text-slate-400 block">Room {item.roomNumber}</span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">{item.quantity}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attach Service to Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-bell-concierge text-[#E17055]"></i>
                <span>Attach Service to Room Bill</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Active In-House Guest *
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#E17055] focus:outline-none"
                >
                  {activeBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      Booking #{b.id} - Room {b.roomNumber} ({b.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Select Service *
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#E17055] focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceName} (₹{s.price}) [{s.category}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#E17055] focus:outline-none"
                />
              </div>

              {/* Price Preview */}
              {(() => {
                const srv = services.find((s) => s.id === selectedServiceId);
                const sub = (srv?.price || 0) * quantity;
                return (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex justify-between items-center">
                    <span className="text-slate-500">Service Line Charge:</span>
                    <span className="font-bold text-[#E17055] font-mono text-sm">
                      ₹{sub.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E17055] to-[#ff7675] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Add to Guest Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
