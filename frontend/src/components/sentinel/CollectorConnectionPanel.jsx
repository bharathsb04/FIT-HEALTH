import React, { useState } from 'react';
import {
  Server,
  ShieldCheck,
  Lock,
  RefreshCw,
  Power,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  Cpu,
  Layers
} from 'lucide-react';
import { sentinelApi } from '../../services/sentinelApi';

export const CollectorConnectionPanel = ({ collector, onRefresh, showToast }) => {
  const [loadingAction, setLoadingAction] = useState('');

  const handleHeartbeat = async () => {
    setLoadingAction('heartbeat');
    try {
      const res = await sentinelApi.sendHeartbeat(collector?.collectorId);
      showToast(res.message || 'Collector heartbeat acknowledged!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Heartbeat failed', 'error');
    } finally {
      setLoadingAction('');
    }
  };

  const handleRotate = async () => {
    if (!window.confirm('Are you sure you want to rotate collector credentials? A new API key and HMAC secret will be generated.')) {
      return;
    }
    setLoadingAction('rotate');
    try {
      const res = await sentinelApi.rotateCredentials(collector?.collectorId);
      showToast('Collector credentials rotated successfully!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Rotation failed', 'error');
    } finally {
      setLoadingAction('');
    }
  };

  const handleToggleRevoke = async () => {
    const isRevoked = collector?.status === 'revoked';
    const action = isRevoked ? 'reactivate' : 'revoke';

    if (!isRevoked && !window.confirm('REVOKE COLLECTOR: This will immediately block all incoming telemetry transmissions from this collector with HTTP 403. Proceed?')) {
      return;
    }

    setLoadingAction(action);
    try {
      if (isRevoked) {
        await sentinelApi.reactivateCollector(collector?.collectorId);
        showToast('Collector reactivated successfully!', 'success');
      } else {
        await sentinelApi.revokeCollector(collector?.collectorId);
        showToast('Collector access revoked. Telemetry ingestion blocked.', 'warning');
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setLoadingAction('');
    }
  };

  const isRevoked = collector?.status === 'revoked';
  const statusColor = isRevoked ? '#ef4444' : '#10b981';

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
      {/* Header with Live Status & Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: isRevoked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: statusColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                {collector?.name || 'On-Premises Core Infrastructure Collector'}
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '6px',
                background: isRevoked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: statusColor,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: statusColor,
                  boxShadow: isRevoked ? 'none' : '0 0 8px #10b981'
                }} />
                {isRevoked ? 'REVOKED (INGEST BLOCKED)' : 'AUTHENTICATED & CONNECTED'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Collector ID: <code style={{ color: 'var(--cyan)' }}>{collector?.collectorId || 'col_sentinel_edge_01'}</code> &bull; Environment: <span style={{ color: 'var(--text-secondary)' }}>{collector?.environment || 'production-dmz'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleHeartbeat}
            disabled={loadingAction === 'heartbeat' || isRevoked}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '11px', fontWeight: 700, gap: '5px' }}
          >
            <Wifi size={13} color="var(--cyan)" />
            <span>{loadingAction === 'heartbeat' ? 'Pinging...' : 'Ping Heartbeat'}</span>
          </button>

          <button
            type="button"
            onClick={handleRotate}
            disabled={loadingAction === 'rotate'}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '11px', fontWeight: 700, gap: '5px' }}
          >
            <RefreshCw size={13} color="var(--amber)" />
            <span>{loadingAction === 'rotate' ? 'Rotating...' : 'Rotate Credentials'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleRevoke}
            disabled={loadingAction === 'revoke' || loadingAction === 'reactivate'}
            className={`btn btn-sm ${isRevoked ? 'btn-primary' : 'btn-outline'}`}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              gap: '5px',
              borderColor: isRevoked ? undefined : 'rgba(239, 68, 68, 0.5)',
              color: isRevoked ? '#080c14' : '#ef4444'
            }}
          >
            <Power size={13} />
            <span>{isRevoked ? 'Reactivate Collector' : 'Revoke Access'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Verified Connection Security Parameters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px'
      }}>
        {/* TLS Parameter */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Lock size={14} color="#10b981" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TLS Channel</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399' }}>
            {collector?.tlsVersion || 'TLSv1.3 (AES-256)'}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Strict HTTPS / TLS connection required
          </span>
        </div>

        {/* Tenant Association */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={14} color="#60a5fa" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Tenant Verified</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#60a5fa' }}>
            tenant_enterprise_sentinel
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Cryptographically bound & isolated
          </span>
        </div>

        {/* Idempotency & Replay Guard */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Key size={14} color="#f59e0b" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Replay Guard</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
            Active (5m Window)
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Unique idempotency key required
          </span>
        </div>

        {/* Last Transmission */}
        <div style={{
          background: 'rgba(2, 6, 23, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Clock size={14} color="#a855f7" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Last Egress Ingest</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {collector?.lastIngestAt ? new Date(collector.lastIngestAt).toLocaleTimeString() : 'Awaiting Ingestion'}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {collector?.lastIngestAt ? new Date(collector.lastIngestAt).toLocaleDateString() : 'Active Standby'}
          </span>
        </div>
      </div>
    </div>
  );
};
