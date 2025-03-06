// src/services/api.js
import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'https://accessible-spirit-423af7c934.strapiapp.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return successful responses
    return response;
  },
  (error) => {
    // Handle error responses based on status codes
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          console.error('Access denied:', error.response.data);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
          
        case 429:
          // Too many requests
          console.error('Rate limit exceeded, please try again later');
          break;
          
        default:
          // Other errors
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in setting up the request
      console.error('Request configuration error:', error.message);
    }
    
    // Return the error for further handling
    return Promise.reject(error);
  }
);

export default api;