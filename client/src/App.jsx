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
  const { token, setUser, isLoggedIn } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(!!token);

  React.useEffect(() => {
    const initAuth = async () => {
      if (token && !useAuthStore.getState().user) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.data.user);
          } else {
            // Token might be invalid, but api.js interceptor handles 401
          }
        } catch (err) {
          console.error('Initial auth fetch failed', err);
        } finally {
          setIsInitializing(false);
        }
      } else {
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
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CursorFollower />
        <LazyMotion features={domAnimation}>
          <AppRouter />
        </LazyMotion>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
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
