import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Fit Health Runtime Error caught by ErrorBoundary]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleClearAndLogout = () => {
    try {
      localStorage.removeItem('fit_health_token');
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app, #080c14)',
          color: '#f8fafc',
          padding: '24px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '16px',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px'
            }}>
              ⚠️
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: '#f8fafc' }}>
              Application Error Detected
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5 }}>
              An unexpected runtime error occurred while rendering the page. You can reload the application or return to the sign-in screen.
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#fca5a5',
                textAlign: 'left',
                marginBottom: '16px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.name ? `${this.state.error.name}: ${this.state.error.message}` : String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  height: '42px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#080c14',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleClearAndLogout}
                style={{
                  flex: 1,
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

