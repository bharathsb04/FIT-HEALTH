import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import { LiveStreetGymMap } from '../components/LiveStreetGymMap';
import {
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Users,
  CheckCircle2,
  ExternalLink,
  Ticket,
  ChevronRight,
  X,
  Compass,
  Zap,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';

export const GymLocatorPage = () => {
  const { showToast } = useFitness();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [selectedCrowd, setSelectedCrowd] = useState('all');
  const [maxPrice, setMaxPrice] = useState(800);
  const [selectedGym, setSelectedGym] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Booking modal
  const [bookingGym, setBookingGym] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingPassType, setBookingPassType] = useState('Single Day Pass');
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState('UPI'); // 'UPI' | 'GPay' | 'Card' | 'Paytm'
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Admin Fee Structure expansion & caching
  const [expandedGymFeeId, setExpandedGymFeeId] = useState(null);
  const [cachedGymFees, setCachedGymFees] = useState({});

  const handleToggleGymFees = async (gymId, e) => {
    if (e) e.stopPropagation();
    if (expandedGymFeeId === gymId) {
      setExpandedGymFeeId(null);
      return;
    }
    setExpandedGymFeeId(gymId);
    if (!cachedGymFees[gymId]) {
      try {
        const res = await api.getGymFees(gymId);
        if (res && res.success) {
          setCachedGymFees(prev => ({ ...prev, [gymId]: res }));
        }
      } catch (err) {
        console.warn('Failed to load fees for gym:', gymId, err);
      }
    }
  };

  const fetchNearbyGyms = async (lat, lng, radius = 5) => {
    setLoading(true);
    try {
      const targetLat = lat != null ? lat : (userCoords?.lat || 28.6139);
      const targetLng = lng != null ? lng : (userCoords?.lng || 77.2090);
      const res = await api.getNearbyGyms(targetLat, targetLng, radius);
      if (res.success) {
        const list = res.gyms || [];
        setGyms(list);
        if (list.length > 0 && !selectedGym) {
          setSelectedGym(list[0]);
        }
      }
    } catch (err) {
      showToast('Could not fetch gyms list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (coords) => {
    setUserCoords(coords);
    fetchNearbyGyms(coords.lat, coords.lng, 5);
  };

  useEffect(() => {
    fetchNearbyGyms();
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('GPS geolocation not supported by browser.', 'info');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        fetchNearbyGyms(coords.lat, coords.lng, 5);
        setLocating(false);
        showToast('📍 Live GPS locked! Gyms within 5km updated.', 'success');
      },
      (err) => {
        setLocating(false);
        showToast('GPS unavailable. Showing nearby fitness centers within 5km.', 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleBookDayPass = async () => {
    if (!bookingGym) return;
    try {
      const res = await api.bookDayPass(bookingGym.id, {
        bookingDate,
        passType: bookingPassType
      });
      if (res.success) {
        setBookingSuccess(res.booking);
        showToast(`Pass booked for ${bookingGym.name}!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Booking failed.', 'error');
    }
  };

  // Filtered gyms
  const filteredGyms = gyms.filter(gym => {
    const matchesSearch =
      gym.name.toLowerCase().includes(search.toLowerCase()) ||
      gym.address.toLowerCase().includes(search.toLowerCase()) ||
      gym.vibe.toLowerCase().includes(search.toLowerCase());

    const matchesVibe = selectedVibe === 'all' || gym.vibe.toLowerCase().includes(selectedVibe.toLowerCase());
    const matchesCrowd = selectedCrowd === 'all' || gym.crowdLevel.toLowerCase() === selectedCrowd.toLowerCase();
    const matchesPrice = gym.dayPassPrice <= maxPrice;

    return matchesSearch && matchesVibe && matchesCrowd && matchesPrice;
  });

  return (
    <div style={{ minHeight: '100%' }}>
      <Header title="Gym Locator" subtitle="Discover verified gyms & book instant day passes" />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Search Bar & Filter Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search gyms by name, equipment, vibe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px', height: '42px', fontSize: '13px' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '42px', height: '42px', padding: 0 }}
            title="Filter gyms"
          >
            <SlidersHorizontal size={17} />
          </button>

          <button
            onClick={handleDetectLocation}
            className="btn btn-secondary"
            style={{ width: '42px', height: '42px', padding: 0, color: 'var(--cyan)' }}
            title="Detect GPS location"
          >
            <Compass size={18} className={locating ? 'spin' : ''} />
          </button>

          {/* Quick Action: Find Nearest Gym within 5km */}
          <button
            onClick={() => {
              if (filteredGyms.length > 0) {
                const nearest = filteredGyms[0];
                setSelectedGym(nearest);
                setViewMode('map');
                showToast(`Nearest gym found: ${nearest.name} (${nearest.distanceKm} km away - within 5km)`, 'success');
              } else {
                handleDetectLocation();
                setViewMode('map');
              }
            }}
            className="btn btn-primary"
            style={{ height: '42px', fontSize: '12px', padding: '0 12px', whiteSpace: 'nowrap', gap: '5px' }}
            title="Locate the nearest gym within 5km of your current position"
          >
            <Zap size={14} fill="#0b0f19" />
            <span>Find Nearest (&lt; 5km)</span>
          </button>
        </div>

        {/* Filter Drawer Card */}
        {showFilters && (
          <div className="card" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Filter Preferences</span>
              <button
                onClick={() => {
                  setSelectedVibe('all');
                  setSelectedCrowd('all');
                  setMaxPrice(800);
                }}
                style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Atmosphere / Vibe</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['all', 'Bodybuilding', 'Modern', 'Community', 'Cross', 'Athletic'].map(v => (
                    <button
                      key={v}
                      onClick={() => setSelectedVibe(v)}
                      className={`chip ${selectedVibe === v ? 'active' : ''}`}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      {v === 'all' ? 'All Vibes' : v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Crowd Level</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['all', 'Low', 'Moderate', 'High'].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrowd(c)}
                      className={`chip ${selectedCrowd === c ? 'active' : ''}`}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      {c === 'all' ? 'Any' : c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex-between">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Day Pass Price</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* View Toggle on Mobile & Laptop Summary */}
        <div className="flex-between" style={{ display: 'flex' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Nearby Gyms within 5 km ({filteredGyms.length}) &bull; <b style={{ color: 'var(--primary)' }}>#1 Nearest: {filteredGyms[0]?.name?.split(' ')[0]} ({filteredGyms[0]?.distanceKm} km)</b>
          </span>

          <div style={{ background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '2px' }}>
            <button
              onClick={() => setViewMode('list')}
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : ''}`}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : ''}`}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Street Map (Live)
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Street Map View */}
        {viewMode === 'map' && (
          <div className="mobile-only" style={{ marginBottom: '14px' }}>
            <LiveStreetGymMap
              gyms={filteredGyms}
              userCoords={userCoords}
              selectedGymId={selectedGym?.id}
              onSelectGym={(g) => setSelectedGym(g)}
              onLocationUpdate={handleLocationUpdate}
              onBookPass={(g) => {
                setBookingGym(g);
                setBookingSuccess(null);
              }}
              height="440px"
              title="Real Street Map — Live GPS Tracking"
              showNearestCard={true}
            />
          </div>
        )}

        {/* Responsive Laptop Grid Layout */}
        <div className="laptop-2-cols">
          {/* Column 1: List of Gym Cards */}
          <div style={{ display: viewMode === 'map' ? 'none' : 'flex', flexDirection: 'column', gap: '12px' }} className="gyms-list-col">
            {filteredGyms.map(gym => (
              <div
                key={gym.id}
                className="card"
                style={{
                  padding: '16px',
                  overflow: 'hidden',
                  borderColor: selectedGym?.id === gym.id ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedGym(gym)}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <img
                    src={gym.image}
                    alt={gym.name}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      background: 'var(--bg-surface)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div className="flex-between">
                      <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{gym.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
                        <Star size={13} fill="#f59e0b" />
                        <span>{gym.rating}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({gym.reviewsCount})</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{gym.distanceKm !== undefined ? `${gym.distanceKm} km away` : 'Within 5 km'} • {gym.address}</span>
                    </p>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '10px' }}>
                        {gym.vibe}
                      </span>
                      <span className="badge" style={{
                        background: gym.crowdLevel === 'Low' ? 'rgba(16, 185, 129, 0.12)' : gym.crowdLevel === 'Moderate' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: gym.crowdLevel === 'Low' ? 'var(--primary)' : gym.crowdLevel === 'Moderate' ? 'var(--amber)' : 'var(--rose)',
                        fontSize: '10px'
                      }}>
                        Crowd: {gym.crowdLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hours & Peak Info */}
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {gym.openingHours}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} /> Peak: {gym.peakHours}
                  </span>
                </div>

                {/* Equipment Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {gym.equipment.slice(0, 3).map((eq, i) => (
                    <span key={i} className="chip" style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {eq}
                    </span>
                  ))}
                  {gym.equipment.length > 3 && (
                    <span className="chip" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      +{gym.equipment.length - 3} more
                    </span>
                  )}
                </div>

                {/* Admin Portal Fee Structure Expansion */}
                <div style={{ marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleGymFees(gym.id, e)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: expandedGymFeeId === gym.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: expandedGymFeeId === gym.id ? '1px solid var(--cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11.5px',
                      color: expandedGymFeeId === gym.id ? 'var(--cyan)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <CreditCard size={13} color="var(--cyan)" />
                      <span>Admin Fee Structure ({cachedGymFees[gym.id]?.feePlans?.length || 4} Plans Available)</span>
                    </span>
                    {expandedGymFeeId === gym.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {expandedGymFeeId === gym.id && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      borderRadius: '8px',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>
                          Official Admin Published Rate Card
                        </span>
                        <span className="badge" style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                          GST 18% Inclusive
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', marginBottom: '8px' }}>
                        {(cachedGymFees[gym.id]?.feePlans || [
                          { name: 'Monthly', price: 1499, billingDuration: '1 Month' },
                          { name: 'Quarterly', price: 3999, billingDuration: '3 Months' },
                          { name: 'Half-Yearly', price: 6999, billingDuration: '6 Months' },
                          { name: 'Annual VIP', price: 11999, billingDuration: '12 Months' }
                        ]).map((plan, idx) => (
                          <div key={idx} style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                          }}>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                              {plan.name}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--primary)' }}>
                              ₹{Number(plan.price).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                              {plan.billingDuration}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        <span>Locker & Trainer Induction included.</span>
                        <a href="/fees" style={{ color: 'var(--cyan)', fontWeight: 700, textDecoration: 'none' }}>
                          View Portal Schedule &rarr;
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid-2" style={{ gap: '8px' }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${gym.latitude},${gym.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation size={13} color="var(--cyan)" />
                    <span>Directions</span>
                  </a>

                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingGym(gym);
                      setBookingSuccess(null);
                    }}
                  >
                    <Ticket size={14} />
                    <span>Day Pass (₹{gym.dayPassPrice})</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredGyms.length === 0 && (
              <div className="card" style={{ padding: '32px 16px', textAlign: 'center' }}>
                <MapPin size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700 }}>No Gyms Match Filters</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Try adjusting your vibe preference or increasing your maximum price filter.
                </p>
              </div>
            )}
          </div>

          {/* Column 2: Sticky Live Street Map & Selected Center Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '74px' }}>
            <LiveStreetGymMap
              gyms={filteredGyms}
              userCoords={userCoords}
              selectedGymId={selectedGym?.id}
              onSelectGym={(g) => setSelectedGym(g)}
              onLocationUpdate={handleLocationUpdate}
              onBookPass={(g) => {
                setBookingGym(g);
                setBookingSuccess(null);
              }}
              height="440px"
              title="Real Street Map — Live GPS Tracking"
              showNearestCard={true}
            />

            {/* Selected Gym Detail Panel on Desktop */}
            {selectedGym && selectedGym.id !== filteredGyms[0]?.id && (
              <div className="card" style={{ padding: '16px', background: 'var(--bg-secondary)', borderColor: 'var(--primary)' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{selectedGym.name}</h4>
                  <span className="badge badge-fitness">₹{selectedGym.dayPassPrice} Day Pass</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {selectedGym.address} • {selectedGym.distanceKm} km away
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {selectedGym.equipment?.map((eq, i) => (
                    <span key={i} className="chip" style={{ fontSize: '11px', padding: '3px 8px' }}>{eq}</span>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-full"
                  style={{ height: '40px', fontSize: '13px' }}
                  onClick={() => {
                    setBookingGym(selectedGym);
                    setBookingSuccess(null);
                  }}
                >
                  <Ticket size={15} />
                  <span>Book Digital Pass for {selectedGym.name.split(' ')[0]}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Pass Booking Modal Sheet */}
      {bookingGym && (
        <div className="modal-overlay" onClick={() => setBookingGym(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Instant Day Pass Booking
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{bookingGym.name}</h3>
              </div>
              <button onClick={() => setBookingGym(null)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {!bookingSuccess ? (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Gain immediate access to all strength zones, cardio decks, and sauna facilities with a Fit Health Verified Pass.
                </p>

                <div className="form-group">
                  <label className="form-label">Booking Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pass Type</label>
                  <select
                    className="form-select"
                    value={bookingPassType}
                    onChange={(e) => setBookingPassType(e.target.value)}
                  >
                    <option value="Single Day Pass">Single Day Full Access (₹{bookingGym.dayPassPrice})</option>
                    <option value="Weekend Combo Pass">Weekend 2-Day Pass (₹{Math.round(bookingGym.dayPassPrice * 1.8)})</option>
                    <option value="Weekly Visitor Pass">7-Day Flexible Pass (₹{Math.round(bookingGym.dayPassPrice * 4.5)})</option>
                  </select>
                </div>

                {/* Indian Payment Method Selection */}
                <div className="form-group">
                  <label className="form-label">Payment Mode (Instant UPI & Cards)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                    {[
                      { id: 'UPI', label: 'UPI / QR' },
                      { id: 'GPay', label: 'Google Pay' },
                      { id: 'PhonePe', label: 'PhonePe' },
                      { id: 'Card', label: 'Card / Net' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setBookingPaymentMethod(pm.id)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: bookingPaymentMethod === pm.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: bookingPaymentMethod === pm.id ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                          color: bookingPaymentMethod === pm.id ? 'var(--primary)' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: '14px', background: 'var(--bg-surface)', marginBottom: '20px' }}>
                  <div className="flex-between" style={{ fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Day Pass Rate</span>
                    <span>₹{bookingGym.dayPassPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Convenience Fee</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>FREE (Fit Health Member)</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
                  <div className="flex-between" style={{ fontSize: '15px', fontWeight: 800 }}>
                    <span>Total Due (INR)</span>
                    <span style={{ color: 'var(--primary)' }}>₹{bookingGym.dayPassPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  id="btn-confirm-pass"
                  className="btn btn-primary btn-full"
                  style={{ height: '48px', fontSize: '15px' }}
                  onClick={handleBookDayPass}
                >
                  <CheckCircle2 size={18} />
                  <span>Pay ₹{bookingGym.dayPassPrice} via {bookingPaymentMethod} & Generate Pass</span>
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={32} color="var(--primary)" />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Pass Confirmed!</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Show this digital voucher code at the front reception desk upon arrival.
                </p>

                <div className="card" style={{ padding: '18px', background: 'var(--bg-surface)', margin: '20px 0', border: '1px dashed var(--primary)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CHECK-IN ACCESS CODE</span>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '4px', margin: '6px 0' }}>
                    {bookingSuccess.accessCode}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Valid for: {bookingSuccess.bookingDate} • {bookingSuccess.passType}
                  </span>
                </div>

                <button
                  className="btn btn-secondary btn-full"
                  onClick={() => setBookingGym(null)}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
