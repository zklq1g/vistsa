import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LazyMotion, domAnimation } from 'framer-motion';
import AppRouter from './router';
import CursorFollower from './components/layout/CursorFollower';

// Design system styles
import './styles/tokens.css';
import './styles/global.css';

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
    </QueryClientProvider>
  );
};

export default App;
