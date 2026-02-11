import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          maxWidth: '800px', 
          margin: '2rem auto',
          border: '2px solid #D32F2F',
          borderRadius: '8px',
          backgroundColor: '#FFF3F3'
        }}>
          <h1 style={{ color: '#D32F2F' }}>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '1rem' }}>
              <summary>Error Details</summary>
              <pre style={{ 
                background: '#f0f0f0', 
                padding: '1rem', 
                overflow: 'auto',
                fontSize: '0.85rem'
              }}>
                {this.state.error?.toString()}
                {this.state.error?.stack}
              </pre>
            </details>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#D32F2F',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
