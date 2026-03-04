// Reverting to stable baseline to debug System Admin black screen.
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LazyMotion, domAnimation } from 'framer-motion';
import AppRouter from './router';
import CursorFollower from './components/layout/CursorFollower';
import ErrorBoundary from './components/layout/ErrorBoundary';

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CursorFollower />
        <ErrorBoundary>
          <LazyMotion features={domAnimation}>
            <AppRouter />
          </LazyMotion>
        </ErrorBoundary>
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
