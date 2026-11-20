import React, { useState } from 'react';
import {
  Shield,
  Filter,
  EyeOff,
  Fingerprint,
  Layers,
  Activity,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ChevronRight,
  Info,
  Server,
  Cloud,
  FileCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

export const PrivacyPipelineVisualizer = ({ pipelineStats, latestProof, lastSimulationResult }) => {
  const [selectedStage, setSelectedStage] = useState(null);

  const stages = [
    {
      id: 1,
      key: 'COLLECT',
      title: '1. Collect',
      subtitle: 'Tier 1 Local Ingest',
      tier: 'Customer Perimeter',
      icon: Server,
      color: '#3b82f6',
      badge: 'Local Only',
      description: 'Raw host, OS, and process telemetry ingested locally within customer environment perimeter. Raw data is stored strictly in Tier 1 local store and never exposed.',
      stats: {
        events: pipelineStats?.COLLECT?.eventCount || 2,
        destination: 'Tier 1 Customer Local Store',
        retention: 'Perimeter Isolated'
      }
    },
    {
      id: 2,
      key: 'ALLOW-LIST / FILTER',
      title: '2. Allow-List / Filter',
      subtitle: 'Schema Enforcement',
      tier: 'Customer Perimeter',
      icon: Filter,
      color: '#10b981',
      badge: 'Strict Policy',
      description: 'Evaluates each telemetry field against the tenant allow-list. Unapproved or unknown fields (e.g. ssn, credit_card, raw_ip) are rejected and dropped immediately.',
      stats: {
        blockedFields: latestProof?.blockedFields?.length || 3,
        approvedFields: latestProof?.approvedFields?.length || 14,
        enforcement: 'Bidirectional (Local + SaaS)'
      }
    },
    {
      id: 3,
      key: 'SECRET SCRUBBING',
      title: '3. Secret Scrubbing',
      subtitle: 'Zero-Secret Sanitization',
      tier: 'Customer Perimeter',
      icon: EyeOff,
      color: '#f59e0b',
      badge: 'Zero Secret Leak',
      description: 'Scans for API keys, bearer tokens, passwords, private keys, and database connection strings. Replaces secrets with [REDACTED_SECRET:<TYPE>]. Original secret values are never logged.',
      stats: {
        redactedCount: latestProof?.redactedCount !== undefined ? latestProof.redactedCount : 1,
        redactedFields: latestProof?.redactedFieldNames?.length || 1,
        logPolicy: 'No Raw Secrets Logged'
      }
    },
    {
      id: 4,
      key: 'PSEUDONYMOUS IDs',
      title: '4. Pseudonymous IDs',
      subtitle: 'Host & Device Anonymization',
      tier: 'Customer Perimeter',
      icon: Fingerprint,
      color: '#8b5cf6',
      badge: 'Isolated Mapping',
      description: 'Replaces raw machine hostnames and IPs with deterministic HMAC-SHA256 tenant-scoped pseudonyms. The real-to-pseudonym mapping is preserved solely in customer storage.',
      stats: {
        assignedPseudo: latestProof?.pseudoHostId || 'pseudo-host-4f9d58a7a516-ntinel',
        mappingLocation: 'Tier 1 Local Only',
        cloudExposure: 'Zero Raw Hostnames'
      }
    },
    {
      id: 5,
      key: 'AGGREGATE',
      title: '5. Aggregate',
      subtitle: 'Time-Window Rollup',
      tier: 'Customer Perimeter',
      icon: Layers,
      color: '#06b6d4',
      badge: '60s Window',
      description: 'Aggregates high-frequency point-in-time metrics into mathematical rollups (min, max, average, p95) to minimize transmission bandwidth and eliminate individual spike tracing.',
      stats: {
        window: '60 Seconds',
        metrics: 'CPU, RAM, Disk, Net',
        percentiles: 'p95 Computed'
      }
    },
    {
      id: 6,
      key: 'ANALYZE',
      title: '6. Analyze',
      subtitle: 'AIOps Anomaly Engine',
      tier: 'Customer Perimeter',
      icon: Activity,
      color: '#ec4899',
      badge: 'Z-Score Detection',
      description: 'Executes statistical Z-Score analysis against dynamic baselines. Flags CPU and memory saturation anomalies locally before egress, tagging severity and anomaly indicators.',
      stats: {
        anomalyDetected: latestProof?.anomalyDetected ? 'CRITICAL SPIKE' : 'NORMAL',
        algorithm: 'Statistical Z-Score (σ > 2.5)',
        severity: latestProof?.anomalySeverity || 'CRITICAL'
      }
    },
    {
      id: 7,
      key: 'POLICY VALIDATION',
      title: '7. Policy Validation',
      subtitle: 'Pre-Egress Verification',
      tier: 'Customer Perimeter',
      icon: FileCheck,
      color: '#10b981',
      badge: 'Compliance Gate',
      description: 'Final automated compliance gate before dispatch. Verifies that 100% of payload fields match the active tenant privacy policy, payload size is within bounds, and zero leaks exist.',
      stats: {
        complianceStatus: '100% Compliant',
        policyVersion: 'v2.4.0',
        maxPayloadKb: '128 KB Limit'
      }
    },
    {
      id: 8,
      key: 'AUTHENTICATED TLS SEND',
      title: '8. Auth TLS Send',
      subtitle: 'Cryptographic Egress',
      tier: 'Tier 1 → Tier 2 SaaS',
      icon: Lock,
      color: '#10b981',
      badge: 'TLSv1.3 + HMAC',
      description: 'Signs sanitized payload with HMAC-SHA256, generates unique idempotency key for replay prevention, computes SHA-256 payload hash, and transmits over encrypted TLSv1.3 to SaaS.',
      stats: {
        tlsProtocol: 'TLSv1.3 (AES-256-GCM)',
        payloadHash: latestProof?.payloadHash ? `${latestProof.payloadHash.slice(0, 16)}...` : 'Verified SHA-256',
        replayGuard: 'Idempotency Key Attached'
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Architecture Tier Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '16px 20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Two-Tier Privacy-Preserving Architecture
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Phase 2 Technical Design
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              <strong>Tier 1:</strong> Local Collector in Customer DMZ (Stages 1–7) &bull; <strong>Tier 2:</strong> Centralized SaaS Platform (Stage 8 + Independent Verification)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(2, 6, 23, 0.6)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <Server size={14} color="#60a5fa" />
            <span>Tier 1 (Local DMZ)</span>
            <ArrowRight size={12} color="#10b981" />
            <Cloud size={14} color="#34d399" />
            <span>Tier 2 (SaaS Platform)</span>
          </div>
        </div>
      </div>

      {/* 8-Stage Pipeline Flow Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px'
      }}>
        {stages.map((stg, idx) => {
          const Icon = stg.icon;
          const isSelected = selectedStage === stg.id;

          return (
            <div
              key={stg.id}
              onClick={() => setSelectedStage(isSelected ? null : stg.id)}
              style={{
                background: isSelected ? 'rgba(30, 41, 59, 0.95)' : 'var(--bg-surface)',
                border: isSelected ? `2px solid ${stg.color}` : '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 8px 24px -4px ${stg.color}33` : 'var(--shadow-sm)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Top Tag & Stage Number */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${stg.color}20`,
                    color: stg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background: `${stg.color}20`,
                    color: stg.color
                  }}>
                    {stg.badge}
                  </span>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                  {stg.title}
                </h4>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {stg.subtitle}
                </div>

                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  margin: '0 0 10px'
                }}>
                  {stg.description}
                </p>
              </div>

              {/* Stage Stat Highlights */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.4)',
                borderRadius: '8px',
                padding: '8px 10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {Object.entries(stg.stats).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {k.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Detail Drawer / Information Card */}
      {selectedStage && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '14px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="#60a5fa" />
              <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>
                Detailed Stage Specification: {stages[selectedStage - 1].title}
              </h4>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Close Details
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {stages[selectedStage - 1].description}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#34d399'
            }}>
              ✓ Stage Audited: Every run logs an immutable event with timestamp, collectorId, decision & counts.
            </div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#60a5fa'
            }}>
              ✓ Zero Sensitive Leak: Original customer credentials and real hostnames stay strictly inside customer perimeter.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
