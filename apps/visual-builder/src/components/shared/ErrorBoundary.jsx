import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: 12 }}>Something went wrong</h1>
          <pre style={{ background: '#0f0f23', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null, errorInfo: null }); }}
            style={{ marginTop: 16, padding: '8px 16px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
