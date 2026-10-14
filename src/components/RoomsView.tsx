import React, { useState, useMemo } from 'react';
import { Room, RoomStatus, RoomType, User } from '../types';

interface RoomsViewProps {
  rooms: Room[];
  currentUser: User;
  onAddRoom: (room: Omit<Room, 'id'>) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (id: number) => void;
  onQuickBookRoom: (room: Room) => void;
}

interface AmenityOption {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
}

const AVAILABLE_AMENITIES: AmenityOption[] = [
  { id: 'Wi-Fi', label: 'Wi-Fi', sublabel: 'High-Speed Fiber Internet', icon: 'fa-wifi' },
  { id: 'Balcony', label: 'Balcony', sublabel: 'Scenic Balcony / Terrace View', icon: 'fa-mountain-sun' },
  { id: 'Air Conditioning', label: 'Air Conditioning', sublabel: 'Climate Controlled AC', icon: 'fa-snowflake' },
  { id: 'Work Desk', label: 'Work Desk', sublabel: 'Ergonomic Desk & Chair', icon: 'fa-laptop' },
  { id: 'Minibar', label: 'Minibar', sublabel: 'Stocked Fridge & Beverages', icon: 'fa-wine-bottle' },
  { id: 'Bathtub', label: 'Marble Bathtub', sublabel: 'Luxury Soaking Tub', icon: 'fa-bath' },
  { id: 'Jacuzzi', label: 'Private Jacuzzi', sublabel: 'Hydrotherapy Jet Tub', icon: 'fa-hot-tub-person' },
];

const CAPACITY_OPTIONS = [
  { val: 1, label: '1 Guest', sub: 'Single', icon: 'fa-user' },
  { val: 2, label: '2 Guests', sub: 'Double / Couple', icon: 'fa-user-group' },
  { val: 3, label: '3 Guests', sub: 'Triple / Small Family', icon: 'fa-users' },
  { val: 4, label: '4+ Guests', sub: 'Suite / Large Family', icon: 'fa-people-roof' },
];

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  currentUser,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onQuickBookRoom,
}) => {
  // Collapsible sidebar state (desktop collapse & mobile drawer)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Multi-select for capacity: array of selected guest counts [1, 2, 3, 4]
  const [selectedCapacities, setSelectedCapacities] = useState<number[]>([]);
  
  // Dual Range Sliders for price
  const [minPrice, setMinPrice] = useState<number>(1000);
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  // Amenity Checkboxes (e.g. Wi-Fi, Balcony)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Sorting: Price (Low-to-High / High-to-Low) & Availability Status
  const [sortBy, setSortBy] = useState<'number' | 'price-asc' | 'price-desc' | 'availability' | 'capacity'>('number');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State for Add / Edit
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('SINGLE');
  const [pricePerNight, setPricePerNight] = useState<number>(2000);
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [maxOccupancy, setMaxOccupancy] = useState<number>(2);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formAmenities, setFormAmenities] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Toggle capacity multi-select
  const toggleCapacity = (cap: number) => {
    setSelectedCapacities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  // Toggle amenity checkbox filter
  const toggleAmenityFilter = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  // Reset all filters to default
  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setFilterStatus('ALL');
    setSelectedCapacities([]);
    setMinPrice(1000);
    setMaxPrice(10000);
    setSelectedAmenities([]);
    setSortBy('number');
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterType !== 'ALL') count++;
    if (filterStatus !== 'ALL') count++;
    if (selectedCapacities.length > 0) count += selectedCapacities.length;
    if (minPrice > 1000 || maxPrice < 10000) count++;
    count += selectedAmenities.length;
    return count;
  }, [searchQuery, filterType, filterStatus, selectedCapacities, minPrice, maxPrice, selectedAmenities]);

  // Amenity match helper
  const roomMatchesAmenity = (r: Room, amenityId: string): boolean => {
    const list = r.amenities || [];
    const desc = (r.description || '').toLowerCase();

    if (amenityId === 'Wi-Fi') {
      return (
        list.includes('Wi-Fi') ||
        list.includes('Wifi') ||
        desc.includes('wi-fi') ||
        desc.includes('wifi') ||
        desc.includes('fiber')
      );
    }
    if (amenityId === 'Balcony') {
      return (
        list.includes('Balcony') ||
        list.includes('Balcony View') ||
        desc.includes('balcony') ||
        desc.includes('terrace')
      );
    }
    if (amenityId === 'Air Conditioning') {
      return list.includes('Air Conditioning') || desc.includes('ac') || desc.includes('air conditioning');
    }
    if (amenityId === 'Work Desk') {
      return list.includes('Work Desk') || desc.includes('desk') || desc.includes('workspace');
    }
    if (amenityId === 'Minibar') {
      return list.includes('Minibar') || desc.includes('minibar') || desc.includes('fridge');
    }
    if (amenityId === 'Bathtub') {
      return list.includes('Bathtub') || desc.includes('bathtub') || desc.includes('soaking tub');
    }
    if (amenityId === 'Jacuzzi') {
      return list.includes('Jacuzzi') || desc.includes('jacuzzi') || desc.includes('spa');
    }
    return list.includes(amenityId);
  };

  // Real-time calculation of matching counts per amenity for badges
  const amenityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    AVAILABLE_AMENITIES.forEach((am) => {
      counts[am.id] = rooms.filter((r) => roomMatchesAmenity(r, am.id)).length;
    });
    return counts;
  }, [rooms]);

  // Real-time calculation of matching counts per capacity
  const capacityCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    rooms.forEach((r) => {
      if (r.maxOccupancy === 1) counts[1]++;
      else if (r.maxOccupancy === 2) counts[2]++;
      else if (r.maxOccupancy === 3) counts[3]++;
      else if (r.maxOccupancy >= 4) counts[4]++;
    });
    return counts;
  }, [rooms]);

  // Filtered and Sorted Rooms in real-time
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((r) => {
        // 1. Text Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNum = r.roomNumber.toLowerCase().includes(q);
          const matchDesc = (r.description || '').toLowerCase().includes(q);
          const matchType = r.roomType.toLowerCase().includes(q);
          if (!matchNum && !matchDesc && !matchType) return false;
        }

        // 2. Room Tier / Type
        if (filterType !== 'ALL' && r.roomType !== filterType) return false;

        // 3. Status
        if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;

        // 4. Multi-Select for Capacity
        if (selectedCapacities.length > 0) {
          const matchesAnySelectedCapacity = selectedCapacities.some((cap) => {
            if (cap === 4) return r.maxOccupancy >= 4;
            return r.maxOccupancy === cap;
          });
          if (!matchesAnySelectedCapacity) return false;
        }

        // 5. Price Range Sliders
        if (r.pricePerNight < minPrice || r.pricePerNight > maxPrice) return false;

        // 6. Checkboxes for Amenities (Must match all checked amenities)
        if (selectedAmenities.length > 0) {
          const matchesAllAmenities = selectedAmenities.every((amenityId) =>
            roomMatchesAmenity(r, amenityId)
          );
          if (!matchesAllAmenities) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const diff = a.pricePerNight - b.pricePerNight;
          if (diff !== 0) return diff;
          return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
        }
        if (sortBy === 'price-desc') {
          const diff = b.pricePerNight - a.pricePerNight;
          if (diff !== 0) return diff;
          return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
        }
        if (sortBy === 'availability') {
          // Available rooms first, followed by Occupied and Maintenance
          const statusPriority: Record<RoomStatus, number> = {
            AVAILABLE: 0,
            OCCUPIED: 1,
            MAINTENANCE: 2,
          };
          const diff = (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
          if (diff !== 0) return diff;
          return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
        }
        if (sortBy === 'capacity') {
          const diff = b.maxOccupancy - a.maxOccupancy;
          if (diff !== 0) return diff;
          return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
        }
        return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
      });
  }, [rooms, searchQuery, filterType, filterStatus, selectedCapacities, minPrice, maxPrice, selectedAmenities, sortBy]);

  // Price presets helper
  const setPricePreset = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  // Open modal handlers
  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setRoomType('SINGLE');
    setPricePerNight(1800);
    setStatus('AVAILABLE');
    setMaxOccupancy(1);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80');
    setFormAmenities(['Wi-Fi', 'Air Conditioning']);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setPricePerNight(room.pricePerNight);
    setStatus(room.status);
    setMaxOccupancy(room.maxOccupancy);
    setDescription(room.description || '');
    setImageUrl(room.imageUrl);
    setFormAmenities(room.amenities || ['Wi-Fi']);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!roomNumber.trim()) {
      setFormError('Room number is required.');
      return;
    }
    if (pricePerNight <= 0) {
      setFormError('Price per night must be greater than zero.');
      return;
    }

    const duplicate = rooms.find(
      (r) => r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase() && (!editingRoom || r.id !== editingRoom.id)
    );
    if (duplicate) {
      setFormError(`Room number ${roomNumber} already exists in inventory.`);
      return;
    }

    if (editingRoom) {
      onUpdateRoom({
        ...editingRoom,
        roomNumber: roomNumber.trim(),
        roomType,
        pricePerNight: Number(pricePerNight),
        status,
        maxOccupancy: Number(maxOccupancy),
        description: description.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        amenities: formAmenities,
      });
    } else {
      onAddRoom({
        roomNumber: roomNumber.trim(),
        roomType,
        pricePerNight: Number(pricePerNight),
        status,
        maxOccupancy: Number(maxOccupancy),
        description: description.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
        amenities: formAmenities,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="rooms-view-container space-y-6 animate-fadeIn">
      {/* Top Action & Summary Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Collapsible Sidebar Toggle Button (Desktop & Mobile) */}
            <button
              onClick={() => {
                // On desktop toggle collapsed state; on mobile toggle mobile drawer
                if (window.innerWidth < 1024) {
                  setIsMobileFilterOpen(!isMobileFilterOpen);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                !isSidebarCollapsed
                  ? 'bg-[#6C5CE7]/10 text-[#6C5CE7] border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/20 dark:bg-[#6C5CE7]/20 dark:text-[#a29bfe]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title={isSidebarCollapsed ? 'Expand Filtering Sidebar' : 'Collapse Filtering Sidebar'}
            >
              <i className={`fa-solid ${isSidebarCollapsed ? 'fa-sliders' : 'fa-angles-left'}`}></i>
              <span className="hidden sm:inline">
                {isSidebarCollapsed ? 'Show Filters' : 'Hide Filters'}
              </span>
              <span className="sm:hidden">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>Room Inventory</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {filteredRooms.length} of {rooms.length} rooms
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time capacity, price range sliders, Wi-Fi & Balcony amenities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Room Button */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/25 transition cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Room</span>
            </button>
          </div>
        </div>

        {/* Dedicated Sorting Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <i className="fa-solid fa-arrow-down-short-wide text-[#6C5CE7]"></i>
              <span>Sort By:</span>
            </span>

            {/* Segmented Toggle Buttons: Price & Availability */}
            <div className="inline-flex flex-wrap items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 text-xs shadow-inner">
              {/* Toggle Price: Low-to-High Button */}
              <button
                type="button"
                onClick={() => setSortBy('price-asc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  sortBy === 'price-asc'
                    ? 'bg-white dark:bg-slate-900 text-[#6C5CE7] dark:text-[#a29bfe] shadow-sm font-bold ring-1 ring-[#6C5CE7]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort rooms by price: Low to High"
              >
                <i className="fa-solid fa-arrow-up-1-9 text-[11px] text-[#6C5CE7]"></i>
                <span>Price: Low-to-High</span>
              </button>

              {/* Toggle Price: High-to-Low Button */}
              <button
                type="button"
                onClick={() => setSortBy('price-desc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  sortBy === 'price-desc'
                    ? 'bg-white dark:bg-slate-900 text-[#6C5CE7] dark:text-[#a29bfe] shadow-sm font-bold ring-1 ring-[#6C5CE7]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort rooms by price: High to Low"
              >
                <i className="fa-solid fa-arrow-down-9-1 text-[11px] text-[#6C5CE7]"></i>
                <span>Price: High-to-Low</span>
              </button>

              {/* Toggle Availability Status Button */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'availability' ? 'number' : 'availability')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  sortBy === 'availability'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold ring-1 ring-emerald-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort rooms by Availability Status (Available rooms first)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    sortBy === 'availability' ? 'bg-white animate-pulse' : 'bg-emerald-500'
                  }`}
                ></span>
                <span>Availability Status</span>
              </button>
            </div>

            {/* Quick 1-click Price Flip Toggle */}
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'price-asc') {
                  setSortBy('price-desc');
                } else {
                  setSortBy('price-asc');
                }
              }}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition cursor-pointer ${
                sortBy === 'price-asc' || sortBy === 'price-desc'
                  ? 'bg-[#6C5CE7]/10 text-[#6C5CE7] border-[#6C5CE7]/30 dark:bg-[#6C5CE7]/20 dark:text-[#a29bfe] font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title="Click to quickly toggle between Price Low-to-High and High-to-Low"
            >
              <i className="fa-solid fa-arrows-up-down text-[11px]"></i>
              <span>
                Toggle Price Direction (
                {sortBy === 'price-desc' ? 'High-to-Low' : 'Low-to-High'})
              </span>
            </button>
          </div>

          {/* Direct Dropdown Selection & Reset */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Options:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="availability">Availability Status (Available First)</option>
              <option value="number">Room Number (Default)</option>
              <option value="capacity">Capacity (Guests)</option>
            </select>
            {sortBy !== 'number' && (
              <button
                type="button"
                onClick={() => setSortBy('number')}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer flex items-center gap-1 px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Reset sorting to default room number order"
              >
                <i className="fa-solid fa-xmark text-[10px]"></i>
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Collapsible Sidebar + Room Cards Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ============================================================== */}
        {/* COLLAPSIBLE FILTERING SIDEBAR */}
        {/* ============================================================== */}
        {(!isSidebarCollapsed || isMobileFilterOpen) && (
          <aside
            id="rooms-sidebar"
            className={`rooms-sidebar w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-all duration-300 ${
              isMobileFilterOpen
                ? 'fixed inset-x-4 top-20 bottom-6 z-50 overflow-y-auto max-w-md mx-auto shadow-2xl lg:static lg:inset-auto lg:max-w-none'
                : 'block'
            }`}
          >
            {/* Sidebar Header with Collapse Button & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
                  <i className="fa-solid fa-sliders text-xs"></i>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Filter Criteria
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Real-time catalog filters
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C5CE7] text-white font-bold ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition flex items-center gap-1"
                    title="Reset all filters"
                  >
                    <i className="fa-solid fa-rotate-left text-[9px]"></i>
                    <span>Reset</span>
                  </button>
                )}

                {/* Desktop Collapse Button */}
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="hidden lg:flex w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 items-center justify-center cursor-pointer transition"
                  title="Collapse Sidebar"
                >
                  <i className="fa-solid fa-angles-left text-xs"></i>
                </button>

                {/* Mobile Close Button */}
                {isMobileFilterOpen && (
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="lg:hidden w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-xs"></i>
                  </button>
                )}
              </div>
            </div>

            {/* 1. Keyword / Number Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Search Room No. or Keyword
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  type="text"
                  placeholder="e.g. 101, Balcony, Deluxe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Range Sliders for Price */}
            <div className="rooms-price-filter p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="price-range-slider" className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <i className="fa-solid fa-indian-rupee-sign text-[#00B894]"></i>
                  <span>Price Range (Nightly)</span>
                </label>
                <span className="text-xs font-mono font-bold text-[#00B894] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Primary Max Price Range Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Max Price (Upper Bound):</span>
                  <span className="font-mono font-bold text-[#6C5CE7] dark:text-[#a29bfe]">
                    ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  id="price-range-slider"
                  name="pricePerNight"
                  data-testid="price-range-slider"
                  aria-label="Filter rooms by pricePerNight"
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onInput={(e) => {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (val >= minPrice) {
                      setMaxPrice(val);
                    }
                  }}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= minPrice) {
                      setMaxPrice(val);
                    }
                  }}
                  className="price-range-slider w-full accent-[#00B894] cursor-pointer h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg transition-all"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹1,000</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'} match
                  </span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Min Price Slider */}
              <div className="space-y-1 pt-1 border-t border-slate-200/70 dark:border-slate-700/60">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Min Price (Lower Bound):</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    ₹{minPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  id="min-price-slider"
                  name="minPricePerNight"
                  data-testid="min-price-slider"
                  aria-label="Filter rooms minimum pricePerNight"
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={minPrice}
                  onInput={(e) => {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (val <= maxPrice) {
                      setMinPrice(val);
                    }
                  }}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= maxPrice) {
                      setMinPrice(val);
                    }
                  }}
                  className="w-full accent-[#6C5CE7] cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg transition-all"
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPricePreset(1000, 10000)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition cursor-pointer ${
                    minPrice === 1000 && maxPrice === 10000
                      ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  All (₹1k-10k)
                </button>
                <button
                  type="button"
                  onClick={() => setPricePreset(1000, 2500)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition cursor-pointer ${
                    minPrice === 1000 && maxPrice === 2500
                      ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  &lt; ₹2,500
                </button>
                <button
                  type="button"
                  onClick={() => setPricePreset(2500, 5000)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition cursor-pointer ${
                    minPrice === 2500 && maxPrice === 5000
                      ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  ₹2.5k - ₹5k
                </button>
                <button
                  type="button"
                  onClick={() => setPricePreset(5000, 10000)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition cursor-pointer ${
                    minPrice === 5000 && maxPrice === 10000
                      ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  ₹5,000+
                </button>
              </div>
            </div>

            {/* 3. Multi-Select for Capacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-users text-[#6C5CE7]"></i>
                  <span>Capacity Multi-Select</span>
                </label>
                {selectedCapacities.length > 0 ? (
                  <button
                    onClick={() => setSelectedCapacities([])}
                    className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear ({selectedCapacities.length})
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">All allowed</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CAPACITY_OPTIONS.map((opt) => {
                  const isSelected = selectedCapacities.includes(opt.val);
                  const count = capacityCounts[opt.val] || 0;
                  return (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => toggleCapacity(opt.val)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-[#6C5CE7] text-[#6C5CE7] dark:text-[#a29bfe] ring-1 ring-[#6C5CE7]'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <i className={`fa-solid ${opt.icon} text-xs`}></i>
                          <span className="text-xs font-bold">{opt.label}</span>
                        </div>
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                            isSelected
                              ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <i className="fa-solid fa-check text-[9px]"></i>}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span className="truncate">{opt.sub}</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">({count})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Checkboxes for Amenities (Wi-Fi, Balcony, etc.) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-sparkles text-amber-500"></i>
                  <span>Amenities Checkboxes</span>
                </label>
                {selectedAmenities.length > 0 && (
                  <button
                    onClick={() => setSelectedAmenities([])}
                    className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear ({selectedAmenities.length})
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity.id);
                  const count = amenityCounts[amenity.id] || 0;
                  const isKeyAmenity = amenity.id === 'Wi-Fi' || amenity.id === 'Balcony';

                  return (
                    <label
                      key={amenity.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer border transition ${
                        isChecked
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-[#6C5CE7] text-[#6C5CE7] dark:text-[#a29bfe] font-semibold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenityFilter(amenity.id)}
                          className="w-4 h-4 rounded accent-[#6C5CE7] cursor-pointer"
                        />
                        <div className="w-5 text-center">
                          <i
                            className={`fa-solid ${amenity.icon} text-xs ${
                              isChecked ? 'text-[#6C5CE7]' : 'text-slate-400'
                            }`}
                          ></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{amenity.label}</span>
                            {isKeyAmenity && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{amenity.sublabel}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Room Tier & Status */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tier Category
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions for Mobile Drawer */}
            {isMobileFilterOpen && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#6C5CE7] text-white text-xs font-semibold cursor-pointer"
                >
                  View {filteredRooms.length} Rooms
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Collapsed Rail (Desktop only when sidebar is collapsed) */}
        {isSidebarCollapsed && (
          <div className="hidden lg:flex flex-col items-center bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm w-16 flex-shrink-0 space-y-4">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center cursor-pointer transition"
              title="Expand Filter Sidebar"
            >
              <i className="fa-solid fa-angles-right text-sm"></i>
            </button>

            <div className="w-8 border-b border-slate-200 dark:border-slate-800"></div>

            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="relative w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              title="Filters"
            >
              <i className="fa-solid fa-sliders text-xs"></i>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6C5CE7] text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="writing-vertical text-[11px] font-bold tracking-wider text-slate-400 uppercase py-4 select-none">
              Filters ({filteredRooms.length})
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROOMS MAIN DISPLAY GRID */}
        {/* ============================================================== */}
        <div className="rooms-grid-container flex-1 w-full space-y-4">
          {/* Active Filter Chips & Summary */}
          {(activeFiltersCount > 0 || sortBy !== 'number') && (
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
                <i className="fa-solid fa-filter text-slate-400 text-[10px]"></i>
                <span>Active Filters & Sorting:</span>
              </span>

              {/* Active Sort Chip */}
              {sortBy !== 'number' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#6C5CE7] dark:text-[#a29bfe] text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800">
                  <i className="fa-solid fa-arrow-down-short-wide text-[10px]"></i>
                  <span>
                    Sort:{' '}
                    {sortBy === 'price-asc'
                      ? 'Price: Low to High'
                      : sortBy === 'price-desc'
                      ? 'Price: High to Low'
                      : sortBy === 'availability'
                      ? 'Availability Status'
                      : 'Capacity'}
                  </span>
                  <i
                    onClick={() => setSortBy('number')}
                    className="fa-solid fa-xmark cursor-pointer hover:opacity-75"
                    title="Reset to default order"
                  ></i>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#6C5CE7] text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800">
                  <span>"{searchQuery}"</span>
                  <i onClick={() => setSearchQuery('')} className="fa-solid fa-xmark cursor-pointer hover:opacity-75"></i>
                </span>
              )}

              {selectedCapacities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#00B894] text-[11px] font-semibold border border-teal-200 dark:border-teal-800"
                >
                  <span>{cap === 4 ? '4+ Guests' : `${cap} Guest(s)`}</span>
                  <i onClick={() => toggleCapacity(cap)} className="fa-solid fa-xmark cursor-pointer hover:opacity-75"></i>
                </span>
              ))}

              {(minPrice > 1000 || maxPrice < 10000) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                  <span>₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}</span>
                  <i
                    onClick={() => {
                      setMinPrice(1000);
                      setMaxPrice(10000);
                    }}
                    className="fa-solid fa-xmark cursor-pointer hover:opacity-75"
                  ></i>
                </span>
              )}

              {selectedAmenities.map((am) => (
                <span
                  key={am}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-200 dark:border-purple-800"
                >
                  <span>{am}</span>
                  <i onClick={() => toggleAmenityFilter(am)} className="fa-solid fa-xmark cursor-pointer hover:opacity-75"></i>
                </span>
              ))}

              {filterType !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 text-[11px] font-semibold border border-blue-200 dark:border-blue-800">
                  <span>Tier: {filterType}</span>
                  <i onClick={() => setFilterType('ALL')} className="fa-solid fa-xmark cursor-pointer hover:opacity-75"></i>
                </span>
              )}

              {filterStatus !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 text-[11px] font-semibold border border-amber-200 dark:border-amber-800">
                  <span>Status: {filterStatus}</span>
                  <i onClick={() => setFilterStatus('ALL')} className="fa-solid fa-xmark cursor-pointer hover:opacity-75"></i>
                </span>
              )}

              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-500 ml-auto cursor-pointer transition flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-left text-[10px]"></i>
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Cards Grid: adapts to 4 columns when sidebar is collapsed */}
          <div
            id="rooms-grid"
            className={`rooms-grid grid grid-cols-1 sm:grid-cols-2 ${
              isSidebarCollapsed
                ? 'lg:grid-cols-3 xl:grid-cols-4'
                : 'xl:grid-cols-3'
            } gap-6`}
          >
            {filteredRooms.map((room) => {
              const isAvailable = room.status === 'AVAILABLE';
              const isOccupied = room.status === 'OCCUPIED';
              const roomAmenities = room.amenities || [];

              return (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover-lift flex flex-col"
                >
                  {/* Room Image with Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={room.imageUrl}
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {/* Room Number Pill */}
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      Room {room.roomNumber}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          isAvailable
                            ? 'bg-emerald-500 text-white'
                            : isOccupied
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {room.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wider">
                          {room.roomType} Tier
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <i className="fa-solid fa-users text-[10px] text-[#00B894]"></i>
                          <span className="font-semibold">{room.maxOccupancy} Guest(s)</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-3">
                        {room.description || 'Spacious, clean room with modern amenities.'}
                      </p>

                      {/* Amenities Chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {roomAmenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                              selectedAmenities.includes(amenity) ||
                              (amenity === 'Balcony View' && selectedAmenities.includes('Balcony'))
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-[#a29bfe] font-bold border border-[#6C5CE7]/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <i
                              className={`fa-solid ${
                                amenity === 'Wi-Fi'
                                  ? 'fa-wifi'
                                  : amenity === 'Balcony View' || amenity === 'Balcony'
                                  ? 'fa-mountain-sun'
                                  : amenity === 'Jacuzzi'
                                  ? 'fa-hot-tub-person'
                                  : amenity === 'Work Desk'
                                  ? 'fa-laptop'
                                  : amenity === 'Minibar'
                                  ? 'fa-wine-bottle'
                                  : 'fa-check'
                              } text-[9px]`}
                            ></i>
                            <span>{amenity}</span>
                          </span>
                        ))}
                        {roomAmenities.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400">
                            +{roomAmenities.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-1 text-slate-800 dark:text-white">
                        <span className="text-lg font-bold">₹{room.pricePerNight.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-400">/ night</span>
                        {room.roomType === 'DELUXE' && (
                          <span className="text-[9px] font-semibold text-indigo-500 ml-auto">+5% Luxury Fee</span>
                        )}
                        {room.roomType === 'SUITE' && (
                          <span className="text-[9px] font-semibold text-purple-500 ml-auto">+10% Concierge</span>
                        )}
                      </div>
                    </div>

                    {/* Card Action Buttons (Book, Edit, Delete) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                      {/* Book Button */}
                      {isAvailable ? (
                        <button
                          onClick={() => onQuickBookRoom(room)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer shadow-sm shadow-emerald-500/20"
                        >
                          <i className="fa-solid fa-calendar-plus text-[10px]"></i>
                          <span>Book</span>
                        </button>
                      ) : (
                        <span className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs text-center font-medium">
                          {room.status}
                        </span>
                      )}

                      {/* Blue Edit Button */}
                      <button
                        onClick={() => openEditModal(room)}
                        title="Edit Room"
                        className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs transition cursor-pointer"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>

                      {/* Red Delete Button (Admin only) */}
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) {
                              onDeleteRoom(room.id);
                            }
                          }}
                          title="Delete Room"
                          className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs transition cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRooms.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <i className="fa-solid fa-filter-circle-xmark text-4xl text-slate-300 dark:text-slate-700 mb-3"></i>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No rooms match your filter criteria</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try widening your price range sliders, clearing some selected amenities (like Wi-Fi or Balcony), or deselecting capacity filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5a4bd4] text-white text-xs font-semibold cursor-pointer transition shadow-md shadow-[#6C5CE7]/30"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-bed text-[#6C5CE7]"></i>
                <span>{editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Hotel Room'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 501"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Room Tier / Category *
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => {
                      const t = e.target.value as RoomType;
                      setRoomType(t);
                      if (t === 'SINGLE') {
                        setMaxOccupancy(1);
                        setPricePerNight(1800);
                      } else if (t === 'DOUBLE') {
                        setMaxOccupancy(2);
                        setPricePerNight(2800);
                      } else if (t === 'DELUXE') {
                        setMaxOccupancy(3);
                        setPricePerNight(4500);
                      } else if (t === 'SUITE') {
                        setMaxOccupancy(4);
                        setPricePerNight(8500);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                  >
                    <option value="SINGLE">SingleRoom (1 Guest)</option>
                    <option value="DOUBLE">DoubleRoom (2 Guests)</option>
                    <option value="DELUXE">DeluxeRoom (+5% Fee)</option>
                    <option value="SUITE">Suite (+10% Concierge)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Base Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Max Occupancy *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={maxOccupancy}
                    onChange={(e) => setMaxOccupancy(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                  />
                </div>
              </div>

              {/* Amenities Checkboxes in Add/Edit Room Modal */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Room Amenities
                </label>
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {AVAILABLE_AMENITIES.map((am) => (
                    <label key={am.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAmenities.includes(am.id) || (am.id === 'Balcony' && formAmenities.includes('Balcony View'))}
                        onChange={() => {
                          const targetKey = am.id === 'Balcony' ? 'Balcony View' : am.id;
                          setFormAmenities((prev) =>
                            prev.includes(targetKey) || prev.includes(am.id)
                              ? prev.filter((a) => a !== targetKey && a !== am.id)
                              : [...prev, targetKey]
                          );
                        }}
                        className="rounded accent-[#6C5CE7] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{am.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Photo URL (Unsplash)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Room Features & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Balcony view, King bed, minibar, marble bathroom..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-none"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  {editingRoom ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
