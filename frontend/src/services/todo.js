// src/services/todo.js
import api from './api';

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const getTodos = async () => {
  try {
    const response = await api.get('/todos', {
      params: {
        sort: 'createdAt:desc',
        populate: '*'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching todos:', error.response?.data || error.message);
    throw new Error('Failed to fetch todos');
  }
};

export const createTodo = async (todoData) => {
  try {
    // Map frontend data to match Strapi model
    const strapiData = {
      title: todoData.title,
      description: todoData.description, // Already in rich text format
      isCompleted: todoData.status === 'completed', // Convert status to isCompleted
    };
    
    // Properly capitalize priority if provided
    if (todoData.priority) {
      strapiData.priority = capitalizeFirstLetter(todoData.priority);
    }
    
    // Add dueDate if provided
    if (todoData.dueDate) {
      strapiData.dueDate = todoData.dueDate;
    }
    
    console.log('Creating todo with payload:', { data: strapiData });
    
    const response = await api.post('/todos', {
      data: strapiData
    });
    
    console.log('Todo created successfully:', response.data);
    
    // Add original status to response for UI display
    const enhancedResponse = {
      ...response.data,
      uiStatus: todoData.status
    };
    
    return enhancedResponse;
  } catch (error) {
    console.error('Create todo error details:', error.response?.data);
    
    if (error.response) {
      const errorDetails = error.response.data.error || error.response.data;
      console.error('Strapi API error:', errorDetails);
      
      // Show more specific error messages based on Strapi 5 error structure
      if (error.response.data?.error?.details?.errors) {
        const validationErrors = error.response.data.error.details.errors;
        const errorMessages = validationErrors.map(err => 
          `${err.path}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
    }
    
    throw new Error(error.message || 'Failed to create todo');
  }
};

export const updateTodo = async (documentId, todoData) => {
  try {
    // Map frontend data to match Strapi model
    const strapiData = {
      title: todoData.title,
      description: todoData.description, // Already in rich text format
      isCompleted: todoData.status === 'completed', // Convert status to isCompleted
    };
    
    // Properly capitalize priority if provided
    if (todoData.priority) {
      strapiData.priority = capitalizeFirstLetter(todoData.priority);
    }
    
    if (todoData.dueDate) {
      strapiData.dueDate = todoData.dueDate;
    }
    
    // Log the update attempt with proper details
    console.log(`Attempting to update todo ${documentId}:`, strapiData);
    
    const response = await api.put(`/todos/${documentId}`, {
      data: strapiData
    });
    
    // Add original status to response for UI display
    const enhancedResponse = {
      ...response.data,
      uiStatus: todoData.status
    };
    
    return enhancedResponse;
  } catch (error) {
    // Enhanced error logging
    console.log('Update todo error details:', error.response?.status);
    
    if (error.response) {
      // Log specific error structure from Strapi
      console.log('Error response data:', error.response.data);
      
      // Check for 404 Not Found
      if (error.response.status === 404) {
        console.log(`Todo ${documentId} not found on server`);
        throw new Error('Todo not found. It may have been deleted.');
      }
      
      // Check for validation errors in Strapi 5 format
      if (error.response.data?.error?.details?.errors) {
        const validationErrors = error.response.data.error.details.errors;
        const errorMessages = validationErrors.map(err => 
          `${err.path}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      
      // Check for other error types
      if (error.response.data && error.response.data.error) {
        const { name, message } = error.response.data.error;
        throw new Error(`${name}: ${message}`);
      }
    }
    
    // Default error message
    throw new Error(error.message || 'Failed to update todo');
  }
};

export const deleteTodo = async (documentId) => {
  try {
    const response = await api.delete(`/todos/${documentId}`);
    return response.data;
  } catch (error) {
    console.log('Delete todo error:', error.response?.status);
    
    // Handle 404 errors in deletion as well
    if (error.response?.status === 404) {
      console.log(`Todo ${documentId} not found during deletion attempt`);
      return null; // Return null to indicate item doesn't exist
    }
    
    throw new Error('Failed to delete todo');
  }
};