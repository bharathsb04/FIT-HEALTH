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
  Layers,
  Database,
  Hash,
  List
} from 'lucide-react';
import { Header } from '../components/Header';
import { useFitness } from '../contexts/FitnessContext';
import { sentinelApi } from '../services/sentinelApi';
import { PrivacyPipelineVisualizer } from '../components/sentinel/PrivacyPipelineVisualizer';
import { CollectorConnectionPanel } from '../components/sentinel/CollectorConnectionPanel';
import { EgressProofPanel } from '../components/sentinel/EgressProofPanel';
import { SimulationController } from '../components/sentinel/SimulationController';

export const SentinelOpsPage = () => {
  const { showToast } = useFitness();
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'connection' | 'proof' | 'audit' | 'policies'
  const [loading, setLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState(null);
  const [proofsList, setProofsList] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [error, setError] = useState('');

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
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load SentinelOps data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const latestProof = proofsList[0] || pipelineData?.recentProofs?.[0];

  return (
    <div style={{ minHeight: '100%' }}>
      <Header
        title="SentinelOps Secure AIOps"
        subtitle="Phase 2: Privacy-Preserving Architecture & Technical Design"
      />

      <div className="page-container" style={{ padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Simulation Engine Banner */}
        <SimulationController
          onSimulationComplete={() => {
            loadData();
          }}
          showToast={showToast}
        />

        {/* Global Security Metrics HUD */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {/* Total Ingested Telemetry */}
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Central SaaS Ingested</span>
              <Database size={15} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
              {pipelineData?.metrics?.totalIngestedTelemetry || proofsList.length}
            </div>
            <span style={{ fontSize: '10px', color: '#60a5fa' }}>Sanitized MongoDB records</span>
          </div>

          {/* Blocked Prohibited Fields */}
          <div className="card" style={{ padding: '14px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Blocked Fields</span>
              <Filter size={15} color="#ef4444" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '6px', color: '#f87171' }}>
              {pipelineData?.metrics?.totalBlockedFields || 3}
            </div>
            <span style={{ fontSize: '10px', color: '#fca5a5' }}>Rejected by Allow-List</span>
          </div>

          {/* Redacted Secrets */}
          <div className="card" style={{ padding: '14px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Redacted Secrets</span>
              <EyeOff size={15} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '6px', color: '#fbbf24' }}>
              {pipelineData?.metrics?.totalRedactedSecrets || 1}
            </div>
            <span style={{ fontSize: '10px', color: '#fde68a' }}>Zero raw secrets leaked</span>
          </div>

          {/* Local Pseudonyms */}
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Pseudonymous Hosts</span>
              <Lock size={15} color="#a855f7" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '6px', color: '#c084fc' }}>
              {pipelineData?.metrics?.localPseudonymsAssigned || 1}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Isolated in Tier 1 mapping</span>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'pipeline' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'pipeline' ? '#080c14' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Shield size={14} />
            <span>Privacy Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'connection' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'connection' ? '#080c14' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Server size={14} />
            <span>Collector Connection</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proof')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'proof' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'proof' ? '#080c14' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileCheck size={14} />
            <span>Egress Proof</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'audit' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'audit' ? '#080c14' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <List size={14} />
            <span>Audit Trail ({auditEvents.length})</span>
          </button>
        </div>

        {/* Tab 1: Privacy Pipeline 8-Stage Flow */}
        {activeTab === 'pipeline' && (
          <PrivacyPipelineVisualizer
            pipelineStats={pipelineData?.stageStats}
            latestProof={latestProof}
          />
        )}

        {/* Tab 2: Collector Connection Panel */}
        {activeTab === 'connection' && (
          <CollectorConnectionPanel
            collector={pipelineData?.collector}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {/* Tab 3: Cryptographic Egress Proof Panel */}
        {activeTab === 'proof' && (
          <EgressProofPanel
            latestProof={latestProof}
            proofsList={proofsList}
          />
        )}

        {/* Tab 4: Stage-by-Stage Immutable Audit Ledger */}
        {activeTab === 'audit' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                  Immutable Stage-by-Stage Audit Events Ledger
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Contains timestamp, collectorId, stage, decision, counts & reason (Zero raw secret values)
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Timestamp</th>
                    <th style={{ padding: '8px' }}>Stage</th>
                    <th style={{ padding: '8px' }}>Decision</th>
                    <th style={{ padding: '8px' }}>Collector / Tenant</th>
                    <th style={{ padding: '8px' }}>Counts</th>
                    <th style={{ padding: '8px' }}>Reason & Diagnostics</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.map((ev) => (
                    <tr key={ev._id || ev.auditId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 700, color: 'var(--cyan)' }}>
                        {ev.stage}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '10px',
                          background: ev.decision === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : ev.decision === 'REDACTED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: ev.decision === 'APPROVED' ? '#34d399' : ev.decision === 'REDACTED' ? '#fbbf24' : '#f87171'
                        }}>
                          {ev.decision}
                        </span>
                      </td>
                      <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {ev.collectorId}
                      </td>
                      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                        {ev.blockedFieldsCount > 0 && <span style={{ color: '#f87171', marginRight: '6px' }}>Blocked: {ev.blockedFieldsCount}</span>}
                        {ev.redactedCount > 0 && <span style={{ color: '#fbbf24' }}>Redacted: {ev.redactedCount}</span>}
                        {!ev.blockedFieldsCount && !ev.redactedCount && <span style={{ color: 'var(--text-muted)' }}>Events: {ev.eventCount}</span>}
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                        {ev.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
