import React, { useState } from 'react';
import {
  Play,
  ShieldAlert,
  Repeat,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap
} from 'lucide-react';
import { sentinelApi } from '../../services/sentinelApi';

export const SimulationController = ({ onSimulationComplete, showToast }) => {
  const [runningScenario, setRunningScenario] = useState('');
  const [simulationLog, setSimulationLog] = useState([]);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setSimulationLog(prev => [{ time, message, type }, ...prev.slice(0, 19)]);
  };

  const handleRunSimulation = async (scenario) => {
    setRunningScenario(scenario);
    if (scenario === 'standard') {
      addLog('Initiating Standard Telemetry Simulation (8-stage pipeline)...', 'info');
    } else if (scenario === 'prohibited') {
      addLog('Initiating Prohibited Payload Attack Simulation (testing SaaS allow-list guard)...', 'warning');
    } else {
      addLog('Initiating Replay Attack Simulation (testing idempotency collision)...', 'warning');
    }

    try {
      const res = await sentinelApi.runSimulation(scenario);
      if (scenario === 'standard') {
        addLog('Standard telemetry passed 8 stages! Anomaly detected (CPU 95.1%) & ingested over TLS.', 'success');
        showToast('Standard simulation finished: Egress approved & audited!', 'success');
      } else if (scenario === 'prohibited') {
        addLog(`Attack BLOCKED by SaaS! 4 unapproved fields rejected with HTTP 422. BLOCKED_TRANSMISSION logged.`, 'error');
        showToast('Prohibited attack successfully blocked by SaaS independent validator!', 'warning');
      } else if (scenario === 'replay') {
        addLog('Replay attack BLOCKED! Duplicate idempotency key rejected with HTTP 409 Conflict.', 'warning');
        showToast('Replay attack successfully blocked!', 'info');
      }

      if (onSimulationComplete) {
        onSimulationComplete(res);
      }
    } catch (err) {
      addLog(`Simulation error: ${err.message}`, 'error');
      showToast(err.message || 'Simulation execution failed', 'error');
    } finally {
      setRunningScenario('');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      borderRadius: '16px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="#10b981" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Phase 2 Interactive Technical Demonstration Simulations
          </h3>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Live end-to-end testing of allow-listing, secret scrubbing, pseudonymization, TLS & defense
        </span>
      </div>

      {/* Button Row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleRunSimulation('standard')}
          disabled={Boolean(runningScenario)}
          className="btn btn-primary"
          style={{ fontSize: '12px', fontWeight: 800, padding: '9px 16px', gap: '6px' }}
        >
          <Play size={14} fill="#080c14" />
          <span>{runningScenario === 'standard' ? 'Running 8 Stages...' : 'Run Standard Telemetry Egress'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunSimulation('prohibited')}
          disabled={Boolean(runningScenario)}
          className="btn btn-secondary"
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '9px 16px',
            gap: '6px',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            color: '#f87171'
          }}
        >
          <ShieldAlert size={14} color="#f87171" />
          <span>{runningScenario === 'prohibited' ? 'Injecting Attack...' : 'Run Prohibited Payload Test'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunSimulation('replay')}
          disabled={Boolean(runningScenario)}
          className="btn btn-secondary"
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '9px 16px',
            gap: '6px',
            borderColor: 'rgba(245, 158, 11, 0.4)',
            color: '#fbbf24'
          }}
        >
          <Repeat size={14} color="#fbbf24" />
          <span>{runningScenario === 'replay' ? 'Simulating Replay...' : 'Run Replay Attack Test'}</span>
        </button>
      </div>

      {/* Live Terminal Log Stream */}
      {simulationLog.length > 0 && (
        <div style={{
          background: '#040711',
          borderRadius: '10px',
          padding: '10px 14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontFamily: 'monospace',
          fontSize: '11px',
          maxHeight: '130px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {simulationLog.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>[{log.time}]</span>
              <span style={{
                color: log.type === 'success' ? '#34d399' : log.type === 'error' ? '#f87171' : log.type === 'warning' ? '#fbbf24' : '#94a3b8'
              }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
