import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Theme
import { theme } from './theme';

// Layouts
import  DashboardLayout  from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Emails from './pages/emails/Emails';
import Calendar from './pages/calendar/Calendar';
import ComposeEmail from './pages/emails/ComposeEmail';
import EmailView from './pages/emails/EmailView';
import Settings from './pages/settings/Settings';
import PageNotFound from './pages/error/PageNotFound';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Routes>
            {/* Public routes - only accessible when not authenticated */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes - only accessible when authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/emails" element={<Emails />} />
                <Route path="/emails/compose" element={<ComposeEmail />} />
                <Route path="/emails/:id" element={<EmailView />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Box>
        
        {/* Enable React Query Devtools in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
