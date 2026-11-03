import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useFitness } from '../contexts/FitnessContext';
import { Header } from '../components/Header';
import { SupplementProductImage } from '../components/SupplementProductImage';
import { resolveSupplementProduct } from '../data/supplementProductMapping';
import {
  Sparkles,
  Search,
  ShieldAlert,
  Clock,
  CheckCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ExternalLink,
  Star,
  Award,
  Flame,
  ShieldCheck,
  Check,
  Tag,
  Zap,
  TrendingUp,
  Package,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const SupplementGuidePage = () => {
  const { showToast } = useFitness();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'price_asc' | 'price_desc'
  const [expandedId, setExpandedId] = useState(null);
  const [activeStoreModal, setActiveStoreModal] = useState(null);

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        const res = await api.getSupplements();
        if (res.success) {
          const list = (res.supplements || []).map(resolveSupplementProduct);
          setSupplements(list);
        }
      } catch (err) {
        showToast('Could not load supplements', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSupplements();
  }, []);

  const handleBuyClick = (e, storeName, url, productName) => {
    e.stopPropagation();
    showToast(`Redirecting to ${storeName} for ${productName}...`, 'info');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filtered = supplements
    .filter(sup => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        sup.name.toLowerCase().includes(q) ||
        (sup.brand && sup.brand.toLowerCase().includes(q)) ||
        sup.purpose.toLowerCase().includes(q) ||
        (sup.category && sup.category.toLowerCase().includes(q)) ||
        (sup.tagline && sup.tagline.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'all' ||
        sup.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Butter' && (sup.category.toLowerCase().includes('butter') || sup.name.toLowerCase().includes('peanut') || sup.name.toLowerCase().includes('butter'))) ||
        (selectedCategory === 'Grains' && (sup.category.toLowerCase().includes('grain') || sup.name.toLowerCase().includes('oat') || sup.name.toLowerCase().includes('muesli')));

      const matchesBrand =
        selectedBrand === 'all' ||
        (sup.brand && sup.brand.toLowerCase().includes(selectedBrand.toLowerCase()));

      return matchesSearch && matchesCat && matchesBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return (b.reviewsCount || 0) - (a.reviewsCount || 0);
    });

  return (
    <div style={{ minHeight: '100%' }}>
      <Header
        title="Supplement Guide & Verified Store"
        subtitle="Evidence-based ergogenic aids, lab certifications & direct shopping links"
      />

      <div className="page-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Hero Stacking & Verified Stores Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.12) 50%, rgba(249, 115, 22, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0b0f19', flexShrink: 0
            }}>
              <ShoppingCart size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-fitness" style={{ fontSize: '10px' }}>
                  VERIFIED SHOPPING PARTNERS
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  100% Authentic & Lab Tested
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '3px 0 0', color: 'var(--text-primary)' }}>
                Official Supplement Stores & Best Deals
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Compare live prices across Amazon, Cultstore, MyProtein, iHerb & Nutrabay with direct one-click shopping links.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['Optimum Nutrition', 'MuscleBlaze', 'Dymatize', 'MyProtein', 'Pintola', 'MyFitness', 'Quaker', 'Fast&Up', 'Amazon', 'Cultstore'].map((store, i) => (
              <span
                key={i}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}
              >
                ✓ {store}
              </span>
            ))}
          </div>
        </div>

        {/* Top Quick Brand Selector Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            🏷️ Top Brands:
          </span>
          {[
            { id: 'all', label: 'All Brands (16)' },
            { id: 'Optimum Nutrition', label: 'Optimum Nutrition' },
            { id: 'MuscleBlaze', label: 'MuscleBlaze' },
            { id: 'Dymatize', label: 'Dymatize' },
            { id: 'MyProtein', label: 'MyProtein' },
            { id: 'Pintola', label: 'Pintola PB' },
            { id: 'MyFitness', label: 'MyFitness PB' },
            { id: 'Quaker', label: 'Quaker Oats' },
            { id: 'Fast&Up', label: 'Fast&Up' },
            { id: 'Cellucor', label: 'Cellucor C4' },
            { id: 'MuscleTech', label: 'MuscleTech' },
            { id: 'Scivation', label: 'Scivation XTEND' }
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: selectedBrand === b.id ? '1px solid var(--cyan)' : '1px solid var(--border-color)',
                background: selectedBrand === b.id ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-surface)',
                color: selectedBrand === b.id ? 'var(--cyan)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: selectedBrand === b.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Responsive Layout */}
        <div className="laptop-sidebar-layout">
          {/* Left Column: Filter Controls & Disclaimer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '74px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search supplements, brands (e.g. Pintola, Oats, Whey)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px', height: '44px', fontSize: '13px' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: '12px', top: '13px',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 800
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Card */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  🏷️ Categories
                </span>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                  {filtered.length} items
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { id: 'all', label: 'All Supplements & Foods', icon: '✨' },
                  { id: 'Protein', label: 'Whey & Plant Protein', icon: '🥛' },
                  { id: 'Butter', label: 'Peanut Butter & Healthy Fats', icon: '🥜' },
                  { id: 'Grains', label: 'Protein Oats & Super Muesli', icon: '🥣' },
                  { id: 'Strength', label: 'Creatine & Power', icon: '⚡' },
                  { id: 'Endurance', label: 'Pre-Workout & BCAAs', icon: '🔥' },
                  { id: 'Joint', label: 'Omega-3 & Adaptogens', icon: '🌿' },
                  { id: 'Hydration', label: 'Electrolytes & Fluid', icon: '💧' },
                  { id: 'Micro', label: 'Multivitamins & ZMA', icon: '💊' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid transparent',
                      background: selectedCategory === cat.id ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)',
                      color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: selectedCategory === cat.id ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat.icon} {cat.label}</span>
                    {selectedCategory === cat.id && <Check size={14} color="var(--primary)" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dedicated Brand Filter Card */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  🏆 Brands & Makers
                </span>
                {selectedBrand !== 'all' && (
                  <button
                    onClick={() => setSelectedBrand('all')}
                    style={{
                      background: 'none', border: 'none', color: 'var(--cyan)',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'all', label: 'All Brands' },
                  { id: 'Optimum Nutrition', label: 'Optimum Nutrition' },
                  { id: 'MuscleBlaze', label: 'MuscleBlaze' },
                  { id: 'Dymatize', label: 'Dymatize' },
                  { id: 'MyProtein', label: 'MyProtein' },
                  { id: 'Pintola', label: 'Pintola' },
                  { id: 'MyFitness', label: 'MyFitness' },
                  { id: 'Quaker', label: 'Quaker' },
                  { id: 'Fast&Up', label: 'Fast&Up' },
                  { id: 'Cellucor', label: 'Cellucor C4' },
                  { id: 'MuscleTech', label: 'MuscleTech' },
                  { id: 'Scivation', label: 'XTEND' },
                  { id: 'Nordic Naturals', label: 'Nordic Naturals' },
                  { id: 'Himalaya', label: 'Himalaya' },
                  { id: 'Universal Nutrition', label: 'Universal / NOW' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '8px',
                      border: selectedBrand === b.id ? '1px solid var(--cyan)' : '1px solid var(--border-color)',
                      background: selectedBrand === b.id ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-surface)',
                      color: selectedBrand === b.id ? 'var(--cyan)' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: selectedBrand === b.id ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter Card */}
            <div className="card" style={{ padding: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                📊 Sort By
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { id: 'popular', label: 'Most Popular' },
                  { id: 'rating', label: 'Highest Rated' },
                  { id: 'price_asc', label: 'Price: Low-High' },
                  { id: 'price_desc', label: 'Price: High-Low' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: sortBy === opt.id ? '1px solid var(--cyan)' : '1px solid var(--border-color)',
                      background: sortBy === opt.id ? 'rgba(6,182,212,0.15)' : 'transparent',
                      color: sortBy === opt.id ? 'var(--cyan)' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Recommended Essentials Stack */}
            <div className="card" style={{
              padding: '14px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Award size={15} color="var(--cyan)" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase' }}>
                  Recommended Daily Foundation Stack
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li><b>1. Whey Protein</b>: 1-2 scoops post-workout</li>
                <li><b>2. Creatine Monohydrate</b>: 5g daily (anytime)</li>
                <li><b>3. Omega-3 Fish Oil</b>: 1000mg EPA/DHA with meals</li>
                <li><b>4. Multivitamin & ZMA</b>: Morning / Bedtime</li>
              </ul>
            </div>

            {/* Mandatory Safety Notice Card */}
            <div
              className="card"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <ShieldAlert size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                <b>Educational Guidance Only</b>: Supplements complement whole-food nutrition. Review with a medical doctor or registered dietician prior to beginning any high-dose protocol.
              </p>
            </div>
          </div>

          {/* Right Column: Supplement Cards List with Images & Shopping Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Showing {filtered.length} Evidence-Based Supplements
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Prices updated daily from verified merchant feeds
              </span>
            </div>

            {loading ? (
              <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <span>Loading verified supplement catalog & shopping links...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No supplements matched your search "<b>{search}</b>". Try another search term.
                </p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedBrand('all'); }}
                  className="btn btn-sm btn-primary"
                  style={{ marginTop: '10px' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filtered.map(sup => {
                const isExpanded = expandedId === sup.id;
                const buyLinks = sup.buyLinks || [];

                return (
                  <div
                    key={sup.id}
                    className="card"
                    style={{
                      padding: '18px',
                      borderColor: isExpanded ? 'var(--primary)' : 'var(--border-color)',
                      transition: 'all 0.2s ease',
                      boxShadow: isExpanded ? '0 8px 28px rgba(16,185,129,0.12)' : 'none'
                    }}
                  >
                    {/* Top Product Header Row */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* High Resolution Product Thumbnail with object-fit: contain */}
                      <SupplementProductImage
                        src={sup.imageUrl || sup.image}
                        fallbackSrc={sup.fallbackImage}
                        alt={sup.name}
                        discount={sup.discount}
                        size={108}
                      />

                      {/* Title, Brand, Rating & Tagline */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span className="badge badge-fitness" style={{ fontSize: '10px' }}>
                            {sup.category}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b', fontWeight: 800 }}>
                            <Star size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>{sup.rating || 4.8}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                              ({(sup.reviewsCount || 1200).toLocaleString()})
                            </span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)' }}>
                          {sup.name}
                        </h3>

                        {sup.brand && (
                          <div style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700, marginBottom: '4px' }}>
                            🏷️ {sup.brand}
                          </div>
                        )}

                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {sup.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Price & Specs Banner */}
                    <div style={{
                      marginTop: '12px',
                      background: 'var(--bg-surface)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                            BEST ONLINE PRICE
                          </span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '17px', fontWeight: 900, color: 'var(--primary)' }}>
                              {sup.inrPrice || `₹${sup.price || '1,299'}`}
                            </span>
                            {sup.originalInrPrice && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                {sup.originalInrPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                            TYPICAL DOSAGE
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {sup.commonUsage ? sup.commonUsage.split('.')[0] : '1 serving daily'}
                          </span>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                            OPTIMAL TIMING
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)' }}>
                            {sup.timing}
                          </span>
                        </div>
                      </div>

                      {/* Certifications Badge Pills */}
                      {sup.certifications && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {sup.certifications.map((cert, ci) => (
                            <span
                              key={ci}
                              style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                borderRadius: '6px',
                                padding: '3px 7px',
                                fontSize: '10px',
                                fontWeight: 800
                              }}
                            >
                              ✓ {cert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ══════════════════════════════════════════════════
                       LIVE SHOPPING LINKS ROW (AMAZON, CULTSTORE, ETC.)
                       ══════════════════════════════════════════════════ */}
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          🛒 Shop Online & Compare Stores:
                        </span>
                        
                        {/* Store Shopping Buttons Grid */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {buyLinks.length > 0 ? (
                            buyLinks.map((link, li) => (
                              <a
                                key={li}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => handleBuyClick(e, link.store, link.url, sup.name)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 12px',
                                  borderRadius: '9px',
                                  background: link.store === 'Amazon'
                                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                    : link.store === 'Cultstore'
                                    ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                    : link.store === 'MyProtein'
                                    ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                                    : link.store === 'iHerb'
                                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                                    : link.store === 'Nutrabay'
                                    ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                                    : link.store === 'Flipkart'
                                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                                    : 'var(--bg-surface)',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textDecoration: 'none',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  transition: 'transform 0.15s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                <span>Buy on {link.store}</span>
                                <span style={{ opacity: 0.9, fontSize: '10px', background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: '4px' }}>
                                  {link.inrPrice || link.price}
                                </span>
                                <ExternalLink size={12} />
                              </a>
                            ))
                          ) : (
                            <a
                              href={`https://www.amazon.in/s?k=${encodeURIComponent(sup.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleBuyClick(e, 'Amazon', `https://www.amazon.in/s?k=${encodeURIComponent(sup.name)}`, sup.name)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 12px',
                                borderRadius: '9px',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 800,
                                textDecoration: 'none'
                              }}
                            >
                              <span>Buy on Amazon</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Expand Details Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : sup.id)}
                        className="btn btn-sm btn-outline"
                        style={{
                          fontSize: '11px',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '8px'
                        }}
                      >
                        <span>{isExpanded ? 'Hide Evidence & Guide' : 'Full Evidence & Stacking Guide'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* ══════════════════════════════════════════════════
                       EXPANDED EVIDENCE & STACKING CLINICAL GUIDE
                       ══════════════════════════════════════════════════ */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '14px',
                        borderTop: '1px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        fontSize: '12px'
                      }}>
                        {/* Physiological Purpose */}
                        <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Zap size={14} color="var(--cyan)" />
                            <h5 style={{ fontWeight: 800, color: 'var(--cyan)', margin: 0, textTransform: 'uppercase', fontSize: '11px' }}>
                              Primary Physiological Mechanism:
                            </h5>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            {sup.purpose}
                          </p>
                        </div>

                        {/* Stacking & Considerations */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: sup.flavorOptions ? '1fr 1fr' : '1fr',
                          gap: '10px'
                        }}>
                          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <Info size={14} color="var(--amber)" />
                              <h5 style={{ fontWeight: 800, color: 'var(--amber)', margin: 0, textTransform: 'uppercase', fontSize: '11px' }}>
                                Clinical Considerations & Stacking:
                              </h5>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                              {sup.considerations}
                            </p>
                          </div>

                          {sup.flavorOptions && (
                            <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <Package size={14} color="var(--primary)" />
                                <h5 style={{ fontWeight: 800, color: 'var(--primary)', margin: 0, textTransform: 'uppercase', fontSize: '11px' }}>
                                  Popular Flavors & Variants:
                                </h5>
                              </div>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                                {sup.flavorOptions.map((flv, fi) => (
                                  <span
                                    key={fi}
                                    style={{
                                      background: 'var(--bg-primary)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '6px',
                                      padding: '3px 8px',
                                      fontSize: '10px',
                                      color: 'var(--text-primary)'
                                    }}
                                  >
                                    {flv}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Safety Caution Alert */}
                        <div style={{
                          background: 'rgba(244, 63, 94, 0.08)',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <ShieldAlert size={16} color="var(--rose)" style={{ flexShrink: 0 }} />
                          <div>
                            <b style={{ color: 'var(--rose)' }}>Specific Caution:</b> {sup.safetyDisclaimer}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
