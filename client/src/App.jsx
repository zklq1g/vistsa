import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LazyMotion, domAnimation } from 'framer-motion';
import AppRouter from './router';
import CursorFollower from './components/layout/CursorFollower';
import { useAuthStore } from './store/authStore';
import api from './services/api';

// Design system styles
import './styles/tokens.css';
import './styles/global.css';

import GlobalErrorModal from './components/layout/GlobalErrorModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on tab switch for dashboard
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  }
});

const App = () => {
  const { token, user, setUser, isLoggedIn } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(!!token);

  // DEBUG HOOKS
  React.useEffect(() => {
    window.VISTA_AUTH = useAuthStore.getState();
    window.VISTA_API = api;
    window.VISTA_VERSION = "2.1.0-DEBUG-CANARY"; // Update this to verify HMR
    console.log('VISTA: Version', window.VISTA_VERSION);
  }, []);

  React.useEffect(() => {
    const initAuth = async () => {
      console.log('VISTA: Starting auth initialization...', { hasToken: !!token });
      if (token && !useAuthStore.getState().user) {
        try {
          console.log('VISTA: Fetching user data...');
          const res = await api.get('/auth/me');
          console.log('VISTA: Auth response:', res);
          if (res.success) {
            setUser(res.data.user);
            console.log('VISTA: User set successfully:', res.data.user.role);
          }
        } catch (err) {
          console.error('VISTA: Initial auth fetch error:', err);
        } finally {
          console.log('VISTA: Finishing initialization...');
          setIsInitializing(false);
        }
      } else {
        console.log('VISTA: No token or user already exists, skipping fetch.');
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [token, setUser]);

  if (isInitializing) {
    return (
      <div style={{
        height: '100svh',
        backgroundColor: 'var(--c-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-heading)',
        gap: 'var(--space-md)'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--c-accent)',
          letterSpacing: '-0.02em'
        }}>
          VISTA
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--c-text-muted)',
          fontSize: '0.875rem'
        }}>
          <div className="spinner" style={{
            width: '16px',
            height: '16px',
            border: '2px solid var(--c-border)',
            borderTopColor: 'var(--c-accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span>Restoring session...</span>
        </div>

        <button
          onClick={() => {
            useAuthStore.getState().logout();
            setIsInitializing(false);
          }}
          style={{
            marginTop: '24px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--c-text-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.target.style.borderColor = 'var(--c-accent)'; e.target.style.color = 'var(--c-text)'; }}
          onMouseOut={e => { e.target.style.borderColor = 'var(--c-border)'; e.target.style.color = 'var(--c-text-muted)'; }}
        >
          Taking too long? Click to reset session
        </button>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* DEBUG BANNER - REMOVE AFTER FIX */}
        <div style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          background: 'rgba(0,0,0,0.8)',
          color: '#0f0',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '10px',
          zIndex: 100000,
          pointerEvents: 'none',
          fontFamily: 'monospace',
          border: '1px solid #0f0'
        }}>
          V: 2.1.2-CANARY | R: {user?.role || 'NONE'} | ID: {user?.id?.slice(-4) || 'NULL'}
        </div>
        
        {/* <CursorFollower /> */}
        <LazyMotion features={domAnimation}>
          <AppRouter />
        </LazyMotion>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          style: {
            background: 'var(--c-surface)',
            color: 'var(--c-text)',
            border: '1px solid var(--c-border)',
            fontFamily: 'var(--font-body)',
            borderRadius: 'var(--r-md)',
          },
          success: {
            iconTheme: {
              primary: '#3fb950',
              secondary: 'var(--c-bg)',
            },
          },
        }}
      />

      {/* Global Error Popup triggered by api.js */}
      <GlobalErrorModal />
    </QueryClientProvider>
  );
};

export default App;
