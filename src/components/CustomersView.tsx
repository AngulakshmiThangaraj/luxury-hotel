import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onSelectCustomerForBooking?: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onSelectCustomerForBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idProof, setIdProof] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!idProof.trim()) {
      errs.idProof = 'Government ID proof (Aadhaar, Passport, DL) is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setIdProof('AADHAAR-');
    setAddress('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setIdProof(customer.idProof);
    setAddress(customer.address);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        idProof: idProof.trim(),
        address: address.trim(),
      });
    } else {
      onAddCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        idProof: idProof.trim(),
        address: address.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Filter customers by name or phone
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.idProof.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Actions Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search by Name or Phone */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            type="text"
            placeholder="Search customer by name or 10-digit phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0984E3]"
          />
        </div>

        {/* Register Customer Button */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0984E3] to-[#74b9ff] hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-[#0984E3]/25 transition cursor-pointer"
        >
          <i className="fa-solid fa-user-plus"></i>
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {filteredCustomers.length} registered guests
          </p>
          <span className="text-xs text-slate-400">Total in Database: {customers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Govt ID Proof</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px]">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    <i className="fa-solid fa-phone text-[10px] text-emerald-500 mr-1.5"></i>
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{c.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      {c.idProof}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 truncate max-w-[200px]" title={c.address}>
                    {c.address || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onSelectCustomerForBooking && (
                        <button
                          onClick={() => onSelectCustomerForBooking(c)}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Book Stay
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(c)}
                        title="Edit Customer"
                        className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 text-xs flex items-center justify-center transition cursor-pointer"
                      >
                        <i className="fa-solid fa-user-pen"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-user text-[#0984E3]"></i>
                <span>{editingCustomer ? 'Update Guest Profile' : 'Register New Guest'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0984E3] ${
                    errors.name ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0984E3] ${
                      errors.phone ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0984E3] ${
                      errors.email ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Identity Proof (Aadhaar / Passport / DL) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AADHAAR-123456789012"
                  value={idProof}
                  onChange={(e) => setIdProof(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0984E3] ${
                    errors.idProof ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.idProof && <p className="text-[10px] text-rose-500 mt-0.5">{errors.idProof}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, City, State, PIN code..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0984E3]"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0984E3] to-[#74b9ff] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  {editingCustomer ? 'Update Guest' : 'Save Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
