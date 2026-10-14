import React, { useState } from 'react';
import { Booking, Invoice } from '../types';

interface BillingViewProps {
  bookings: Booking[];
  onPerformCheckout: (bookingId: number, paymentMode: string, transactionRef?: string) => void;
  activeInvoice: Invoice | null;
  onCloseInvoice: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  bookings,
  onPerformCheckout,
  activeInvoice,
  onCloseInvoice,
}) => {
  // Filter for active checked-in guests who can checkout
  const inHouseBookings = bookings.filter((b) => b.status === 'CHECKED_IN');
  const pastCheckouts = bookings.filter((b) => b.status === 'CHECKED_OUT');

  // Checkout Modal State
  const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState<Booking | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');

  const openCheckoutModal = (booking: Booking) => {
    setSelectedBookingForCheckout(booking);
    setPaymentMode('UPI');
    setTransactionRef(`TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
  };

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCheckout) return;

    onPerformCheckout(selectedBookingForCheckout.id, paymentMode, transactionRef);
    setSelectedBookingForCheckout(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Active In-House Guests Waiting for Checkout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-file-invoice-dollar text-[#FDCB6E]"></i>
              <span>Active Stays Pending Final Bill Settlement</span>
            </h2>
            <p className="text-xs text-slate-400">
              Calculate total room charges + auxiliary services tab + 12% GST upon checkout
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {inHouseBookings.length} Guests In-House
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Room & Type</th>
                <th className="py-3 px-4">Stay Duration</th>
                <th className="py-3 px-4">Room Charge</th>
                <th className="py-3 px-4">Services Tab</th>
                <th className="py-3 px-4">Est. Total (+12% GST)</th>
                <th className="py-3 px-4 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {inHouseBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-[#6C5CE7]">#{b.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</p>
                    <p className="text-[10px] text-slate-400">{b.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Room {b.roomNumber}</span>
                    <span className="block text-[10px] text-slate-400">{b.roomType}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div>
                      {b.checkInDate} &rarr; {b.checkOutDate}
                    </div>
                    <span className="text-[10px] text-slate-400">{b.totalNights} nights</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">₹{b.roomCharge.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-emerald-600 font-semibold">
                      ₹{b.servicesTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-slate-400">({b.services.length} items consumed)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openCheckoutModal(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00B894] to-[#55efc4] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#00B894]/25 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-receipt mr-1"></i>
                      <span>Generate Bill</span>
                    </button>
                  </td>
                </tr>
              ))}

              {inHouseBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No active guests in-house ready for checkout right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Settled Invoices List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Settled Check-out Invoices</h3>
          <span className="text-xs text-slate-400">{pastCheckouts.length} Completed Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Guest</th>
                <th className="py-2.5 px-4">Room</th>
                <th className="py-2.5 px-4">Total Settled</th>
                <th className="py-2.5 px-4">Tax (12% GST)</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {pastCheckouts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-mono font-semibold text-[#6C5CE7]">
                    INV-2026-0000{b.id}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">{b.customerName}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">Room {b.roomNumber} ({b.roomType})</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">₹{b.gstAmount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                      Paid & Settled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout & Payment Settlement Modal */}
      {selectedBookingForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-cash-register text-[#00B894]"></i>
                <span>Check-Out & Settle Bill</span>
              </h3>
              <button
                onClick={() => setSelectedBookingForCheckout(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmCheckout} className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Guest Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {selectedBookingForCheckout.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    Room {selectedBookingForCheckout.roomNumber} ({selectedBookingForCheckout.roomType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stay:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {selectedBookingForCheckout.totalNights} Night(s)
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                  <span className="text-slate-500">Room Tariff:</span>
                  <span className="font-mono">₹{selectedBookingForCheckout.roomCharge.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auxiliary Services:</span>
                  <span className="font-mono text-emerald-600">
                    +₹{selectedBookingForCheckout.servicesTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (12%):</span>
                  <span className="font-mono text-[#FD79A8]">
                    +₹{selectedBookingForCheckout.gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Grand Total Payable:</span>
                  <span className="text-[#00B894] font-mono">
                    ₹{selectedBookingForCheckout.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#00B894] focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash at Front Desk</option>
                  <option value="NET_BANKING">Net Banking / Direct Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Transaction Reference ID
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-REF-998811"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#00B894] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCheckout(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00B894] to-[#55efc4] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Settle & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Printable Tax Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8 relative border border-slate-200">
            {/* Modal Controls (No Print) */}
            <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check"></i>
                <span>Checkout Successful! Bill Settled.</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#6C5CE7]/30 cursor-pointer"
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  onClick={onCloseInvoice}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div id="printable-invoice" className="space-y-6 text-xs font-sans">
              {/* Hotel Header */}
              <div className="flex items-start justify-between border-b pb-6 border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] text-white flex items-center justify-center font-bold text-sm">
                      <i className="fa-solid fa-hotel"></i>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                      Grand Horizon Luxury Resort
                    </h1>
                  </div>
                  <p className="text-slate-500">Plot 42, Marine Vista Boulevard, Coastal Enclave</p>
                  <p className="text-slate-500">GSTIN: 29AAACH7788Q1Z2 • CIN: U55101KA2024PTC998811</p>
                  <p className="text-slate-500">Email: concierge@grandhorizon.com • Tel: +91 80 4455 6677</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] mb-2">
                    Tax Invoice / Bill of Supply
                  </span>
                  <p className="font-mono font-bold text-sm text-[#6C5CE7]">{activeInvoice.invoiceNumber}</p>
                  <p className="text-slate-400 text-[11px]">Date: {activeInvoice.invoiceDate.split('T')[0]}</p>
                </div>
              </div>

              {/* Guest & Stay Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 mb-1">Billed To (Guest):</p>
                  <p className="font-semibold text-slate-800">{activeInvoice.customerName}</p>
                  <p className="text-slate-600">Mobile: {activeInvoice.customerPhone}</p>
                  <p className="text-slate-600">Email: {activeInvoice.customerEmail}</p>
                  <p className="text-slate-600">ID Proof: {activeInvoice.customerIdProof}</p>
                  <p className="text-slate-600">Address: {activeInvoice.customerAddress || 'On File'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 mb-1">Reservation Specs:</p>
                  <p className="text-slate-700">
                    Room Number: <strong className="text-slate-900">Room {activeInvoice.roomNumber}</strong>
                  </p>
                  <p className="text-slate-700">Tier / Category: {activeInvoice.roomType} Tier</p>
                  <p className="text-slate-700">
                    Check-In: <strong>{activeInvoice.checkInDate}</strong>
                  </p>
                  <p className="text-slate-700">
                    Check-Out: <strong>{activeInvoice.checkOutDate}</strong>
                  </p>
                  <p className="text-slate-700">Total Duration: {activeInvoice.totalNights} Night(s)</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty / Nights</th>
                    <th className="p-2.5 text-right">Unit Rate (₹)</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Room Charge Line Item */}
                  <tr>
                    <td className="p-2.5 font-medium">
                      Room Accommodation: Room {activeInvoice.roomNumber} [{activeInvoice.roomType} Tier]
                      {activeInvoice.roomType === 'DELUXE' && (
                        <span className="block text-[10px] text-slate-400">Includes 5% Luxury Amenity Surcharge</span>
                      )}
                      {activeInvoice.roomType === 'SUITE' && (
                        <span className="block text-[10px] text-slate-400">Includes 10% Presidential Concierge</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">{activeInvoice.totalNights} Nights</td>
                    <td className="p-2.5 text-right font-mono">
                      ₹{activeInvoice.pricePerNight.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold">
                      ₹{activeInvoice.roomCharge.toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Auxiliary Services Line Items */}
                  {activeInvoice.services.map((srv, idx) => (
                    <tr key={idx} className="bg-slate-50/50">
                      <td className="p-2.5 text-slate-700">
                        Auxiliary: {srv.serviceName} ({srv.serviceCategory})
                      </td>
                      <td className="p-2.5 text-center font-mono">{srv.quantity}</td>
                      <td className="p-2.5 text-right font-mono">₹{srv.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        ₹{srv.subtotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal, 12% GST, and Grand Total */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Before Taxes:</span>
                    <span className="font-mono">₹{activeInvoice.subtotalBeforeGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (6.0%):</span>
                    <span className="font-mono">₹{(activeInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (6.0%):</span>
                    <span className="font-mono">₹{(activeInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-2 text-sm">
                    <span>Total Bill (Incl. 12% GST):</span>
                    <span className="text-[#6C5CE7] font-mono">
                      ₹{activeInvoice.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details & Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Payment Settlement:</p>
                  <p className="font-semibold text-emerald-700">
                    Paid via {activeInvoice.paymentMode} • Ref: {activeInvoice.transactionRef}
                  </p>
                  <p className="text-slate-400 text-[10px] mt-1">Thank you for staying at Grand Horizon Resort!</p>
                </div>
                <div className="text-right">
                  <div className="w-40 border-b border-slate-400 pb-1 mb-1 font-signature text-center text-sm font-semibold text-slate-700">
                    Authorized Signatory
                  </div>
                  <p className="text-[10px] text-slate-400">Grand Horizon Front Desk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
