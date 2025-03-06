// src/services/auth.js
import api from './api';

export const loginUser = async (identifier, password) => {
  try {
    // Log authentication attempt
    console.log('Authentication attempt for:', identifier);
    
    // Detailed request with proper structure
    const response = await api.post('/auth/local', {
      identifier,
      password
    });
    
    console.log('Authentication response:', response.status);
    return response.data;
  } catch (error) {
    // Extract error details with fallbacks
    let errorMessage = 'Authentication failed';
    let statusCode = error.response?.status || 'unknown';
    
    if (error.response) {
      console.error('Auth API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Extract Strapi error message if available
      errorMessage = error.response.data?.error?.message || 
                   error.response.data?.message || 
                   `Server error (${statusCode})`;
    } else if (error.request) {
      console.error('Auth No Response:', error.request);
      errorMessage = 'No response from authentication server';
    } else {
      console.error('Auth Request Setup Error:', error.message);
    }
    
    throw new Error(errorMessage);
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post('/auth/local/register', {
      username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    let errorMessage = 'Registration failed';
    
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};