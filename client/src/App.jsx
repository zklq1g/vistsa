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
        height: '100vh',
        backgroundColor: 'var(--c-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--c-text-muted)',
        fontFamily: 'var(--font-body)'
      }}>
        Initializing...
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
