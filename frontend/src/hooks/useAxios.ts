import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios';
import { useAuth } from './useAuth';

// Environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UseAxiosProps {
  baseURL?: string;
  headers?: Record<string, string>;
}

interface RequestConfig extends AxiosRequestConfig {
  useAuth?: boolean;
  showError?: boolean;
  silent?: boolean;
}

interface UseAxiosReturn {
  axiosInstance: AxiosInstance;
  loading: boolean;
  error: string | null;
  request: <T = any>(
    config: RequestConfig
  ) => Promise<{ 
    data: T | null; 
    error: string | null;
    status?: number;
    statusText?: string;
    headers?: any;
  }>;
  clearError: () => void;
}

export const useAxios = (props: UseAxiosProps = {}): UseAxiosReturn => {
  const { baseURL = API_URL, headers: defaultHeaders = {} } = props;
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    },
    withCredentials: true,
  });

  // Add request interceptor for auth token
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config: any) => {
        // Don't show loading for silent requests
        if (!(config as RequestConfig).silent) {
          setLoading(true);
        }

        // Add auth token if available and useAuth is not explicitly set to false
        const useAuthHeader = (config as RequestConfig).useAuth !== false;
        if (token && useAuthHeader) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add signal for request cancellation
        if (!controllerRef.current) {
          controllerRef.current = new AbortController();
        }
        config.signal = controllerRef.current.signal;

        return config;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for common error handling
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => {
        setLoading(false);
        return response;
      },
      async (error: AxiosError) => {
        setLoading(false);
        
        // Handle request cancellation
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        // Handle network errors
        if (!error.response) {
          const errorMessage = 'Network error. Please check your internet connection.';
          setError(errorMessage);
          return Promise.reject(new Error(errorMessage));
        }

        // Handle 401 Unauthorized
        if (error.response.status === 401) {
          if (token) {
            logout();
          }
          const errorMessage = 'Your session has expired. Please log in again.';
          setError(errorMessage);
          return Promise.reject(new Error(errorMessage));
        }

        // Handle other errors
        const errorData = error.response?.data as any;
        const errorMessage = errorData?.message || 
                           errorData?.error || 
                           error.response.statusText || 
                           'An error occurred';
        
        if ((error.config as RequestConfig)?.showError !== false) {
          setError(errorMessage);
        }
        
        return Promise.reject(new Error(errorMessage));
      }
    );

    // Cleanup function
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [token, logout, axiosInstance]);

  // Main request function
  const request = useCallback(
    async <T = any>(
      config: RequestConfig
    ): Promise<{ 
      data: T | null; 
      error: string | null;
      status?: number;
      statusText?: string;
      headers?: any;
    }> => {
      try {
        setError(null);
        const response = await axiosInstance<T>({
          ...config,
          headers: {
            ...(config.headers || {}),
          },
        });
        
        return { 
          data: response.data, 
          error: null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error) {
        if (axios.isCancel(error)) {
          return { 
            data: null, 
            error: 'Request was cancelled',
            status: 0,
            statusText: 'Cancelled'
          };
        }
        
        const axiosError = error as AxiosError<{ message?: string; error?: string }>;
        let errorMessage = 'An error occurred';
        let status = 500;
        let statusText = 'Internal Server Error';
        
        if (axiosError.response) {
          const responseData = axiosError.response.data as any;
          errorMessage = responseData?.message || 
                        responseData?.error || 
                        axiosError.response.statusText || 
                        `Error: ${axiosError.response.status}`;
          status = axiosError.response.status;
          statusText = axiosError.response.statusText;
        } else if (axiosError.request) {
          errorMessage = 'No response from server. Please check your connection.';
          status = 0;
          statusText = 'No Response';
        } else {
          errorMessage = axiosError.message || 'Request setup failed';
          status = 0;
          statusText = 'Request Error';
        }
        
        return { 
          data: null, 
          error: errorMessage,
          status,
          statusText,
        };
      }
    },
    [axiosInstance]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    axiosInstance,
    loading,
    error,
    request,
    clearError,
  };
};

export default useAxios;
