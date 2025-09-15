import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return {
        user: JSON.parse(user),
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
    
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  });

  const navigate = useNavigate();

  // Set up response interceptor for token refresh
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config;
        
        // If error is not 401 or there's no original request, reject
        if (error.response?.status !== 401 || !originalRequest) {
          return Promise.reject(error);
        }

        // If we already tried to refresh the token, log the user out
        if (originalRequest.url?.includes('auth/refresh')) {
          logout();
          return Promise.reject(error);
        }

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            logout();
            return Promise.reject(error);
          }

          const { data } = await api.post<LoginResponse>('/auth/refresh', { refreshToken });
          
          // Update tokens in localStorage and state
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Update axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          
          // Update state
          setAuthState({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log the user out
          logout();
          return Promise.reject(refreshError);
        }
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      
      // Store tokens and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Update state
      setAuthState({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return data.user;
    } catch (error) {
      const errorMessage = error instanceof AxiosError<ErrorResponse> 
        ? error.response?.data?.message || 'Login failed. Please try again.'
        : 'An unexpected error occurred';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data } = await api.post<LoginResponse>('/auth/register', { 
        name, 
        email, 
        password 
      });
      
      // Store tokens and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Update state
      setAuthState({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return data.user;
    } catch (error) {
      const errorMessage = error instanceof AxiosError<ErrorResponse> 
        ? error.response?.data?.message || 'Registration failed. Please try again.'
        : 'An unexpected error occurred';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API if token exists
      if (authState.token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear axios headers
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      // Navigate to login
      navigate('/login');
    }
  }, [authState.token, navigate]);

  const getCurrentUser = useCallback(async () => {
    if (!authState.token) return null;
    
    try {
      const { data } = await api.get<User>('/auth/me');
      
      // Update user in localStorage and state
      localStorage.setItem('user', JSON.stringify(data));
      
      setAuthState(prev => ({
        ...prev,
        user: data,
      }));
      
      return data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // If the token is invalid, log the user out
      if (error instanceof AxiosError && error.response?.status === 401) {
        logout();
      }
      return null;
    }
  }, [authState.token, logout]);

  return {
    ...authState,
    login,
    register,
    logout,
    getCurrentUser,
  };
};

export default useAuth;
