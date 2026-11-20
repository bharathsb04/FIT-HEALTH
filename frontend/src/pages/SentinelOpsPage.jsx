import React, { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  FileCheck,
  Activity,
  Settings,
  EyeOff,
  Filter,
  Lock,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Layers,
  Database,
  Hash,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Cloud,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart3,
  Clock,
  ExternalLink,
  Power
} from 'lucide-react';
import { sentinelApi } from '../services/sentinelApi';
import { PrivacyPipelineVisualizer } from '../components/sentinel/PrivacyPipelineVisualizer';
import { CollectorConnectionPanel } from '../components/sentinel/CollectorConnectionPanel';
import { EgressProofPanel } from '../components/sentinel/EgressProofPanel';
import { SimulationController } from '../components/sentinel/SimulationController';
import '../sentinel.css';

export const SentinelOpsPage = ({ onBack }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('overview'); // 'overview' | 'pipeline' | 'connection' | 'proof' | 'incidents' | 'audit' | 'policy'
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineData, setPipelineData] = useState(null);
  const [proofsList, setProofsList] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      const [statusRes, proofsRes, auditRes] = await Promise.all([
        sentinelApi.getPipelineStatus(),
        sentinelApi.getEgressProofs(),
        sentinelApi.getAuditEvents()
      ]);
      setPipelineData(statusRes);
      setProofsList(proofsRes.proofs || []);
      setAuditEvents(auditRes.auditEvents || []);
    } catch (err) {
      console.warn('SentinelOps data refresh notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // 8s live refresh
    return () => clearInterval(interval);
  }, []);

  const latestProof = proofsList[0] || pipelineData?.recentProofs?.[0];

  const navItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { key: 'pipeline', label: 'Privacy Pipeline (8-Stage)', icon: Shield, badge: '8 STAGES' },
    { key: 'connection', label: 'Collector Connection', icon: Server, badge: 'TLSv1.3' },
    { key: 'proof', label: 'Egress Proof & Manifest', icon: FileCheck },
    { key: 'incidents', label: 'Alerts & Incidents', icon: AlertTriangle, badge: 'AIOPS' },
    { key: 'audit', label: 'Audit Trail Ledger', icon: List },
    { key: 'policy', label: 'Privacy Policy Rules', icon: Settings }
  ];

  return (
    <div className="sentinel-dashboard-shell">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : toastMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* 1. FIXED COLLAPSIBLE SIDEBAR */}
      <aside className={`sentinel-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div>
          {/* Brand Header */}
          <div className="sentinel-brand">
            <div className="sentinel-brand-icon">
              <Shield size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="sentinel-brand-title">
                <span>SENTINELOPS</span>
                <span className="sentinel-brand-badge">SECURE AIOPS &bull; PHASE 2</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <ul className="sentinel-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <li
                  key={item.key}
                  className={`sentinel-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveNav(item.key)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.badge && <span className="sentinel-nav-badge">{item.badge}</span>}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--sentinel-border-subtle)', paddingTop: '14px' }}>
          {!sidebarCollapsed && (
            <div style={{
              background: 'rgba(2, 6, 23, 0.5)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '11px',
              color: 'var(--sentinel-text-secondary)'
            }}>
              <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                Enterprise Tenant A
              </div>
              <div style={{ fontSize: '10px', color: 'var(--sentinel-cyan)' }}>
                Tier 1 Local Collector Active
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
            {onBack && !sidebarCollapsed && (
              <button
                type="button"
                onClick={onBack}
                className="sentinel-btn sentinel-btn-secondary"
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                &larr; Switch Portal
              </button>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="sentinel-btn sentinel-btn-secondary"
              style={{ padding: '6px', borderRadius: '8px' }}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD VIEWPORT */}
      <div className="sentinel-main-viewport">
        {/* Top Navbar */}
        <header className="sentinel-top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="sentinel-search-bar">
              <Search size={15} color="var(--sentinel-text-muted)" />
              <input
                type="text"
                className="sentinel-search-input"
                placeholder="Search telemetry, pseudo host IDs, audit logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live Connection Pill */}
            <div className="sentinel-status-pill">
              <span className="sentinel-status-pulse" />
              <span>COLLECTOR CONNECTED &bull; TLSv1.3</span>
            </div>

            {/* Policy Pill */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Lock size={12} />
              <span>Policy {pipelineData?.policyVersion || 'v2.4.0'}</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadData}
              className="sentinel-btn sentinel-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '11px', gap: '4px' }}
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="sentinel-content-container">
          
          {/* Top Simulation Engine Banner */}
          <SimulationController
            onSimulationComplete={() => {
              loadData();
              showToast('Simulation executed and synced to dashboard!', 'success');
            }}
            showToast={showToast}
          />

          {/* VIEW: OVERVIEW DASHBOARD */}
          {activeNav === 'overview' && (
            <>
              {/* Power BI KPI CARDS GRID */}
              <section className="sentinel-kpi-grid">
                {/* KPI 1: Ingested Telemetry */}
                <div className="sentinel-kpi-card" style={{ '--kpi-accent': 'var(--sentinel-cyan)' }}>
                  <div className="sentinel-kpi-header">
                    <span className="sentinel-kpi-title">CENTRAL SAAS INGESTED</span>
                    <Database size={16} color="var(--sentinel-cyan)" />
                  </div>
                  <div className="sentinel-kpi-value">
                    {pipelineData?.metrics?.totalIngestedTelemetry || proofsList.length || 4}
                  </div>
                  <div className="sentinel-kpi-footer">
                    <TrendingUp size={13} color="var(--sentinel-teal-neon)" />
                    <span style={{ color: 'var(--sentinel-teal-neon)', fontWeight: 700 }}>+14.2%</span>
                    <span>sanitized records in MongoDB</span>
                  </div>
                </div>

                {/* KPI 2: Blocked Prohibited Fields */}
                <div className="sentinel-kpi-card" style={{ '--kpi-accent': 'var(--sentinel-red)' }}>
                  <div className="sentinel-kpi-header">
                    <span className="sentinel-kpi-title">BLOCKED PROHIBITED FIELDS</span>
                    <Filter size={16} color="var(--sentinel-red)" />
                  </div>
                  <div className="sentinel-kpi-value" style={{ color: '#f87171' }}>
                    {pipelineData?.metrics?.totalBlockedFields || 3}
                  </div>
                  <div className="sentinel-kpi-footer">
                    <span style={{ color: '#fca5a5', fontWeight: 700 }}>100% REJECTED</span>
                    <span>by Allow-List Policy</span>
                  </div>
                </div>

                {/* KPI 3: Redacted Secrets */}
                <div className="sentinel-kpi-card" style={{ '--kpi-accent': 'var(--sentinel-amber)' }}>
                  <div className="sentinel-kpi-header">
                    <span className="sentinel-kpi-title">REDACTED SECRETS</span>
                    <EyeOff size={16} color="var(--sentinel-amber)" />
                  </div>
                  <div className="sentinel-kpi-value" style={{ color: '#fbbf24' }}>
                    {pipelineData?.metrics?.totalRedactedSecrets || 1}
                  </div>
                  <div className="sentinel-kpi-footer">
                    <CheckCircle2 size={13} color="var(--sentinel-teal-neon)" />
                    <span>Zero secrets leaked to cloud</span>
                  </div>
                </div>

                {/* KPI 4: Pseudonymous Host Identifiers */}
                <div className="sentinel-kpi-card" style={{ '--kpi-accent': 'var(--sentinel-purple)' }}>
                  <div className="sentinel-kpi-header">
                    <span className="sentinel-kpi-title">PSEUDONYMOUS HOSTS</span>
                    <Lock size={16} color="var(--sentinel-purple)" />
                  </div>
                  <div className="sentinel-kpi-value" style={{ color: '#c084fc' }}>
                    {pipelineData?.metrics?.localPseudonymsAssigned || 1}
                  </div>
                  <div className="sentinel-kpi-footer">
                    <span>Deterministic HMAC-SHA256</span>
                  </div>
                </div>

                {/* KPI 5: AIOps Active Anomalies */}
                <div className="sentinel-kpi-card" style={{ '--kpi-accent': '#ec4899' }}>
                  <div className="sentinel-kpi-header">
                    <span className="sentinel-kpi-title">AIOPS ACTIVE ANOMALIES</span>
                    <Activity size={16} color="#ec4899" />
                  </div>
                  <div className="sentinel-kpi-value" style={{ color: '#f472b6' }}>
                    {latestProof?.anomalyDetected ? '1' : '0'}
                  </div>
                  <div className="sentinel-kpi-footer">
                    <span style={{ color: '#f472b6', fontWeight: 700 }}>
                      {latestProof?.anomalyDetected ? 'CRITICAL CPU SPIKE (95.1%)' : 'NORMAL (Z < 2.5)'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Power BI STYLE DASHBOARD CHARTS & ALERTS */}
              <section className="sentinel-charts-grid">
                {/* CHART 1: Real-Time CPU & Memory Utilization Timeline with Anomaly Threshold Line */}
                <div className="sentinel-panel">
                  <div className="sentinel-panel-header">
                    <div className="sentinel-panel-title">
                      <Cpu size={16} color="var(--sentinel-cyan)" />
                      <span>Real-Time Host Telemetry & Anomaly Threshold (AIOps)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--sentinel-cyan)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sentinel-cyan)' }} />
                        CPU % (Observed: 95.1%)
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a855f7' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
                        Memory % (86.3%)
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                        <span style={{ width: '12px', height: '2px', background: '#ef4444', borderTop: '2px dashed #ef4444' }} />
                        Anomaly Gate (&gt;90%)
                      </span>
                    </div>
                  </div>

                  {/* Responsive SVG Timeline Chart */}
                  <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                    <svg className="sentinel-svg-chart" viewBox="0 0 700 240" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="40" y1="40" x2="680" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="40" y1="90" x2="680" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="40" y1="140" x2="680" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="40" y1="190" x2="680" y2="190" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                      {/* Threshold Line: 90% CPU */}
                      <line x1="40" y1="52" x2="680" y2="52" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" />
                      <text x="590" y="46" fill="#f87171" fontSize="10" fontWeight="700">ANOMALY GATE (90%)</text>

                      {/* Memory Area & Line */}
                      <path
                        d="M 40 160 Q 120 155, 200 150 T 360 142 T 520 135 L 660 128 L 660 210 L 40 210 Z"
                        fill="url(#memGradient)"
                      />
                      <path
                        d="M 40 160 Q 120 155, 200 150 T 360 142 T 520 135 L 660 128"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                      />

                      {/* CPU Area & Line (Spiking over 90% at the end) */}
                      <path
                        d="M 40 170 Q 120 165, 200 160 T 360 130 T 520 80 L 660 42 L 660 210 L 40 210 Z"
                        fill="url(#cpuGradient)"
                      />
                      <path
                        d="M 40 170 Q 120 165, 200 160 T 360 130 T 520 80 L 660 42"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />

                      {/* Anomaly Spike Marker */}
                      <circle cx="660" cy="42" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="660" cy="42" r="12" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <text x="610" y="30" fill="#f87171" fontSize="11" fontWeight="800">95.4% CRITICAL</text>

                      {/* Y-Axis Labels */}
                      <text x="10" y="44" fill="#64748b" fontSize="10">100%</text>
                      <text x="10" y="94" fill="#64748b" fontSize="10">75%</text>
                      <text x="10" y="144" fill="#64748b" fontSize="10">50%</text>
                      <text x="10" y="194" fill="#64748b" fontSize="10">25%</text>
                    </svg>
                  </div>
                </div>

                {/* CHART 2: Field Sanitization Distribution Donut / Bar Representation */}
                <div className="sentinel-panel">
                  <div className="sentinel-panel-header">
                    <div className="sentinel-panel-title">
                      <Filter size={16} color="var(--sentinel-teal)" />
                      <span>Egress Field Disposition</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: 'auto 0' }}>
                    {/* Approved Fields Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--sentinel-teal-neon)', fontWeight: 700 }}>✓ Approved Allow-List</span>
                        <span style={{ fontWeight: 800 }}>14 Fields (78%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
                      </div>
                    </div>

                    {/* Blocked Prohibited Fields Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>✕ Blocked / Dropped</span>
                        <span style={{ fontWeight: 800 }}>3 Fields (16%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '16%', height: '100%', background: '#ef4444' }} />
                      </div>
                    </div>

                    {/* Redacted Secret Fields Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>🛡️ Redacted Secrets</span>
                        <span style={{ fontWeight: 800 }}>1 Field (6%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '6%', height: '100%', background: '#f59e0b' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(2, 6, 23, 0.4)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--sentinel-text-secondary)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    🛡️ <strong>Zero-Trust Guarantee:</strong> Unapproved fields dropped locally; SaaS independently inspects every inbound byte.
                  </div>
                </div>
              </section>

              {/* RECENT ALERTS & INCIDENT LEDGER */}
              <section className="sentinel-panel">
                <div className="sentinel-panel-header">
                  <div className="sentinel-panel-title">
                    <AlertTriangle size={16} color="var(--sentinel-amber)" />
                    <span>Real-Time Security & Anomaly Incidents Stream</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--sentinel-text-muted)' }}>
                    Live audit of automated defense triggers
                  </span>
                </div>

                <div className="sentinel-incident-list">
                  {/* Alert 1: CPU Anomaly */}
                  <div className="sentinel-incident-item critical">
                    <Activity size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#f87171' }}>
                          AIOps CPU Anomaly Detected &bull; Critical (Z-Score: 4.01)
                        </strong>
                        <span style={{ fontSize: '10px', color: 'var(--sentinel-text-muted)' }}>Just Now</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--sentinel-text-secondary)', margin: '4px 0 0' }}>
                        Host <code style={{ color: 'var(--sentinel-cyan)' }}>{latestProof?.pseudoHostId || 'pseudo-host-efc48f5849b0-ntinel'}</code> observed CPU utilization at 95.4% (Threshold: 90.0%, baseline σ: 15.0). Alert flagged in centralized SaaS MongoDB.
                      </p>
                    </div>
                  </div>

                  {/* Alert 2: Prohibited Fields Blocked */}
                  <div className="sentinel-incident-item warning">
                    <Filter size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#fbbf24' }}>
                          Allow-List Security Enforcement &bull; Prohibited Fields Dropped
                        </strong>
                        <span style={{ fontSize: '10px', color: 'var(--sentinel-text-muted)' }}>2m ago</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--sentinel-text-secondary)', margin: '4px 0 0' }}>
                        Fields <code>customer_ssn</code>, <code>plaintext_password</code>, and <code>raw_ip</code> were intercepted and blocked by the Stage 2 Allow-List engine.
                      </p>
                    </div>
                  </div>

                  {/* Alert 3: Secret Scrubbing */}
                  <div className="sentinel-incident-item info">
                    <EyeOff size={18} color="var(--sentinel-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--sentinel-cyan)' }}>
                          Secret Scrubbing &bull; Zero Raw Secret Values Logged
                        </strong>
                        <span style={{ fontSize: '10px', color: 'var(--sentinel-text-muted)' }}>5m ago</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--sentinel-text-secondary)', margin: '4px 0 0' }}>
                        Sanitized residual Bearer tokens and connection strings in memory before aggregation. Field names recorded with zero secret exposure.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* VIEW: PRIVACY PIPELINE 8-STAGE VISUALIZER */}
          {activeNav === 'pipeline' && (
            <PrivacyPipelineVisualizer
              pipelineStats={pipelineData?.stageStats}
              latestProof={latestProof}
            />
          )}

          {/* VIEW: COLLECTOR CONNECTION PANEL */}
          {activeNav === 'connection' && (
            <CollectorConnectionPanel
              collector={pipelineData?.collector}
              onRefresh={loadData}
              showToast={showToast}
            />
          )}

          {/* VIEW: EGRESS PROOF & MANIFEST */}
          {activeNav === 'proof' && (
            <EgressProofPanel
              latestProof={latestProof}
              proofsList={proofsList}
            />
          )}

          {/* VIEW: INCIDENTS & ALERTS STREAM */}
          {activeNav === 'incidents' && (
            <div className="sentinel-panel">
              <div className="sentinel-panel-header">
                <div className="sentinel-panel-title">
                  <AlertTriangle size={16} color="var(--sentinel-red)" />
                  <span>AIOps Anomaly Alerts & Security Incidents Log</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--sentinel-text-muted)' }}>
                  Total registered anomalies in MongoDB: {pipelineData?.recentProofs?.filter(p => p.anomalyDetected).length || 1}
                </span>
              </div>

              <div className="sentinel-incident-list" style={{ maxHeight: 'none' }}>
                <div className="sentinel-incident-item critical">
                  <Activity size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#f87171' }}>AIOps Critical Anomaly Alert #ANOM-9482</strong>
                    <div style={{ fontSize: '11px', color: 'var(--sentinel-text-secondary)', marginTop: '4px' }}>
                      Host: <code>{latestProof?.pseudoHostId}</code> &bull; Metric: <code>cpu_utilization_pct</code> &bull; Value: <strong>95.4%</strong> (Z-Score: 4.01)
                    </div>
                  </div>
                </div>

                <div className="sentinel-incident-item warning">
                  <Filter size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#fbbf24' }}>Allow-List Policy Interception #SEC-1092</strong>
                    <div style={{ fontSize: '11px', color: 'var(--sentinel-text-secondary)', marginTop: '4px' }}>
                      Blocked 3 fields not declared in tenant privacy policy allow-list. Egress prevented.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: AUDIT TRAIL LEDGER */}
          {activeNav === 'audit' && (
            <div className="sentinel-panel">
              <div className="sentinel-panel-header">
                <div className="sentinel-panel-title">
                  <List size={16} color="var(--sentinel-cyan)" />
                  <span>Immutable Stage-by-Stage Audit Ledger ({auditEvents.length} Records)</span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--sentinel-border)', color: 'var(--sentinel-text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Timestamp</th>
                      <th style={{ padding: '10px' }}>Stage</th>
                      <th style={{ padding: '10px' }}>Decision</th>
                      <th style={{ padding: '10px' }}>Collector ID</th>
                      <th style={{ padding: '10px' }}>Counts</th>
                      <th style={{ padding: '10px' }}>Diagnostics & Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEvents.map((ev) => (
                      <tr key={ev._id || ev.auditId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '10px', color: 'var(--sentinel-text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 700, color: 'var(--sentinel-cyan)' }}>
                          {ev.stage}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            fontSize: '10px',
                            background: ev.decision === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : ev.decision === 'REDACTED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: ev.decision === 'APPROVED' ? '#34d399' : ev.decision === 'REDACTED' ? '#fbbf24' : '#f87171'
                          }}>
                            {ev.decision}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--sentinel-text-muted)' }}>
                          {ev.collectorId}
                        </td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                          {ev.blockedFieldsCount > 0 && <span style={{ color: '#f87171', marginRight: '6px' }}>Blocked: {ev.blockedFieldsCount}</span>}
                          {ev.redactedCount > 0 && <span style={{ color: '#fbbf24' }}>Redacted: {ev.redactedCount}</span>}
                          {!ev.blockedFieldsCount && !ev.redactedCount && <span style={{ color: 'var(--sentinel-text-muted)' }}>Events: {ev.eventCount}</span>}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--sentinel-text-secondary)' }}>
                          {ev.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PRIVACY POLICY & ALLOW-LIST RULES */}
          {activeNav === 'policy' && (
            <div className="sentinel-panel">
              <div className="sentinel-panel-header">
                <div className="sentinel-panel-title">
                  <Settings size={16} color="var(--sentinel-cyan)" />
                  <span>Tenant Privacy Policy & Egress Allow-List Configuration</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--sentinel-teal-neon)' }}>
                  Active Policy: {pipelineData?.policyVersion || 'v2.4.0'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--sentinel-text-secondary)', lineHeight: 1.5 }}>
                  The active privacy policy defines which fields are permitted to egress from the customer environment into the centralized SaaS platform. Any field not explicitly listed below is rejected locally in Tier 1 and independently blocked in Tier 2.
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(pipelineData?.policy?.allowedFields || []).map((field) => (
                    <span
                      key={field}
                      style={{
                        fontSize: '11px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: 'var(--sentinel-cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace'
                      }}
                    >
                      ✓ {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
