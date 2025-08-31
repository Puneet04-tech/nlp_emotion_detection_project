import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '40px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            <h2 style={{ 
              color: '#fff',
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '16px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error. Don't worry, this happens sometimes!
            </p>
            <details style={{ 
              whiteSpace: 'pre-wrap', 
              marginBottom: '30px',
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <summary style={{
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                🔍 View Technical Details
              </summary>
              <div style={{ 
                marginTop: '15px', 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'Monaco, Consolas, "Liberation Mono", monospace'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#ff6b6b' }}>Error:</strong> {this.state.error && this.state.error.toString()}
                </div>
                <div>
                  <strong style={{ color: '#4ecdc4' }}>Stack Trace:</strong> 
                  <pre style={{ 
                    marginTop: '5px',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              🔄 Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
