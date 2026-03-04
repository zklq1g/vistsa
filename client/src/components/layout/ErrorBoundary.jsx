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
        this.setState({ error, errorInfo });
        console.error("App Crash caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    color: '#f0ebe0',
                    fontFamily: 'sans-serif',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ color: '#f85149' }}>Something went wrong.</h1>
                    <p style={{ maxWidth: '600px', margin: '20px 0', opacity: 0.8 }}>
                        The application crashed. This is often caused by a missing variable or a data mismatch.
                    </p>
                    <div style={{
                        textAlign: 'left',
                        backgroundColor: '#161b22',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        width: '100%',
                        overflow: 'auto',
                        maxHeight: '400px',
                        border: '1px solid #30363d'
                    }}>
                        <p style={{ color: '#f85149', fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
                        <pre style={{ fontSize: '12px', opacity: 0.6, marginTop: '10px' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '30px',
                            padding: '12px 24px',
                            backgroundColor: '#d4c5a9',
                            color: '#0a0a0a',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Return to Homepage
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
