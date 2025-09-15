import { AxiosError } from 'axios';
import { useNotification } from '../components/common/Notification';
import { useCallback } from 'react';

interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export const handleApiError = (
  error: unknown, 
  defaultMessage = 'An error occurred. Please try again.'
): ApiError => {
  const axiosError = error as AxiosError<{
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
  }>;

  // Handle network errors (no response from server)
  if (!axiosError.response) {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
    };
  }

  const { status, statusText, data } = axiosError.response;
  
  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return {
        message: data?.message || data?.error || 'Bad request. Please check your input.',
        status,
        statusText,
        errors: data?.errors,
      };
    case 401:
      return {
        message: 'Your session has expired. Please log in again.',
        status,
        statusText: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        status,
        statusText: 'Forbidden',
        code: 'FORBIDDEN',
      };
    case 404:
      return {
        message: 'The requested resource was not found.',
        status,
        statusText: 'Not Found',
        code: 'NOT_FOUND',
      };
    case 422:
      return {
        message: 'Validation failed. Please check your input.',
        status,
        statusText: 'Unprocessable Entity',
        errors: data?.errors,
        code: 'VALIDATION_ERROR',
      };
    case 429:
      return {
        message: 'Too many requests. Please try again later.',
        status,
        statusText: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
      };
    case 500:
      return {
        message: 'An unexpected error occurred on the server. Please try again later.',
        status,
        statusText: 'Internal Server Error',
        code: 'SERVER_ERROR',
      };
    case 503:
      return {
        message: 'Service is currently unavailable. Please try again later.',
        status,
        statusText: 'Service Unavailable',
        code: 'SERVICE_UNAVAILABLE',
      };
    default:
      return {
        message: data?.message || data?.error || defaultMessage,
        status,
        statusText,
      };
  }
};

export const useApiError = () => {
  const { showNotification } = useNotification();

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const apiError = handleApiError(error, customMessage);
    
    // Show error notification
    showNotification(apiError.message, 'error');
    
    // Return the error for further handling if needed
    return apiError;
  }, [showNotification]);

  return { handleError };
};

export default handleApiError;
