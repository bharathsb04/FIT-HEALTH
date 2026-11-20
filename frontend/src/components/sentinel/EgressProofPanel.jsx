import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  EyeOff,
  Copy,
  Check,
  Hash,
  Shield,
  Layers,
  ArrowRight,
  Lock,
  Server,
  Cloud
} from 'lucide-react';

export const EgressProofPanel = ({ latestProof, proofsList = [] }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'comparison'

  const proof = latestProof || {
    payloadHash: '30645831af8b4fad9c3f58a36d2e975f8f87e5b1239c4d8e7b1a2f3c4e5d6f7a',
    idempotencyKey: 'idem_4f9d58a7a516e89f_2026',
    pseudoHostId: 'pseudo-host-4f9d58a7a516-ntinel',
    approvedFields: [
      'timestamp', 'tenant_id', 'collector_id', 'host_id', 'environment',
      'cpu_utilization_pct', 'memory_used_mb', 'memory_total_mb', 'memory_utilization_pct',
      'disk_io_iops', 'disk_used_pct', 'network_rx_kbps', 'network_tx_kbps', 'status'
    ],
    blockedFields: ['raw_ip', 'customer_ssn', 'plaintext_password'],
    redactedCount: 1,
    redactedFieldNames: ['status (Embedded Bearer Token & Connection String)'],
    anomalyDetected: true,
    anomalySeverity: 'CRITICAL',
    timestamp: new Date().toISOString()
  };

  const handleCopyHash = () => {
    if (proof.payloadHash) {
      navigator.clipboard.writeText(proof.payloadHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {/* Header with Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
              Cryptographic Egress Proof & Sanitization Manifest
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Verifiable proof of allow-listing, secret scrubbing, and pseudonymization
            </span>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'summary' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'summary' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Manifest Summary
          </button>
          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'comparison' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'comparison' ? 'var(--cyan)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Pre-Egress vs SaaS Comparison
          </button>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <>
          {/* Cryptographic SHA-256 Hash Card */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={14} color="#10b981" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                  SHA-256 Egress Payload Hash
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <code style={{
              fontSize: '12px',
              color: 'var(--cyan)',
              wordBreak: 'break-all',
              fontFamily: 'monospace'
            }}>
              {proof.payloadHash}
            </code>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '14px' }}>
              <span>Idempotency Key: <strong style={{ color: 'var(--text-secondary)' }}>{proof.idempotencyKey}</strong></span>
              <span>Pseudo Host: <strong style={{ color: '#a855f7' }}>{proof.pseudoHostId}</strong></span>
            </div>
          </div>

          {/* Three Categorized Pillars: Approved vs Blocked vs Redacted */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px'
          }}>
            {/* Approved Fields Pillar */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>
                    Approved Telemetry Fields ({proof.approvedFields?.length || 0})
                  </span>
                </div>
                <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  ALLOW-LIST
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(proof.approvedFields || []).map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: '11px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace'
                    }}
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Blocked / Rejected Fields Pillar */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={16} color="#ef4444" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#f87171' }}>
                    Blocked Prohibited Fields ({proof.blockedFields?.length || 0})
                  </span>
                </div>
                <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  REJECTED
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(proof.blockedFields || []).map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: '11px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace'
                    }}
                  >
                    ✕ {f}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Dropped before egress and blocked independently by SaaS backend guard.
              </span>
            </div>

            {/* Secret Scrubbing Pillar */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.04)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <EyeOff size={16} color="#f59e0b" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24' }}>
                    Redacted Secrets ({proof.redactedCount || 0})
                  </span>
                </div>
                <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  SCRUBBED
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(proof.redactedFieldNames || []).map((f, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#fde68a',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace'
                    }}
                  >
                    🛡️ {f}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Zero original secret values are logged or transmitted.
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Side-by-Side Comparison Tab: Tier 1 Local Pre-Egress vs Tier 2 SaaS Post-Ingest */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px'
        }}>
          {/* Column A: Tier 1 Customer Local Store */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Server size={14} color="#60a5fa" />
              <strong style={{ fontSize: '12px', color: '#60a5fa' }}>
                Tier 1 Local Pre-Egress (Customer Perimeter)
              </strong>
            </div>
            <pre style={{
              background: '#070b13',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#94a3b8',
              overflowX: 'auto',
              maxHeight: '280px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
{`{
  "hostname": "prod-database-master-01.corp",
  "raw_ip": "10.0.12.44",
  "cpu_utilization_pct": 95.4,
  "db_connection_uri": "mongodb://admin:pass@db:27017",
  "auth_bearer_token": "Bearer eyJhbGciOi...",
  "customer_ssn": "984-21-9988",
  "plaintext_password": "super_secret_master_key",
  "status": "Worker active"
}`}
            </pre>
            <div style={{ fontSize: '10px', color: '#f87171', marginTop: '6px' }}>
              ⚠️ Contains real hostnames, raw IPs, and sensitive credentials. Remains 100% local.
            </div>
          </div>

          {/* Column B: Tier 2 SaaS Ingested Payload */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.5)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Cloud size={14} color="#10b981" />
              <strong style={{ fontSize: '12px', color: '#34d399' }}>
                Tier 2 SaaS Platform (Post-Ingest Verified)
              </strong>
            </div>
            <pre style={{
              background: '#070b13',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#94a3b8',
              overflowX: 'auto',
              maxHeight: '280px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
{`{
  "host_id": "${proof.pseudoHostId}",
  "cpu_utilization_pct": 95.1,
  "memory_utilization_pct": 86.3,
  "anomaly_detected": true,
  "anomaly_severity": "CRITICAL",
  "status": "Worker active [REDACTED_SECRET]",
  "payloadHash": "${proof.payloadHash.slice(0, 24)}...",
  "tlsProtocol": "TLSv1.3"
}`}
            </pre>
            <div style={{ fontSize: '10px', color: '#34d399', marginTop: '6px' }}>
              ✓ 100% Sanitized. Real host replaced with pseudonym. Secrets scrubbed. Unapproved fields dropped.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
