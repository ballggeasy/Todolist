// src/components/Todo/TodoItem.jsx
import React, { useState, useEffect } from 'react';
import { updateTodo, deleteTodo } from '../../services/todo';
import { richTextToPlainText, plainTextToRichText } from '../../utils/richTextHandler';
import './TodoItem.css';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  // Extract attributes safely, handling different response structures
  const attributes = todo.attributes || todo;
  const documentId = todo.documentId || todo.id;
  const isOverdue = todo.isOverdue || false;
  
  // Default values and data extraction
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(attributes.title || '');
  
  // Convert rich text description to plain text for editing
  const plainDescription = richTextToPlainText(attributes.description);
  const [editedDescription, setEditedDescription] = useState(plainDescription);
  
  const [editedPriority, setEditedPriority] = useState(attributes.priority || 'medium');
  const [editedDueDate, setEditedDueDate] = useState(attributes.dueDate || '');
  
  // Derive status from isCompleted (or use stored UI status)
  const derivedStatus = attributes.isCompleted ? 'completed' : 'pending';
  const [editedStatus, setEditedStatus] = useState(todo.uiStatus || derivedStatus);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset states when todo changes
  useEffect(() => {
    if (todo) {
      setEditedTitle(attributes.title || '');
      setEditedDescription(richTextToPlainText(attributes.description));
      setEditedPriority(attributes.priority || 'medium');
      setEditedDueDate(attributes.dueDate || '');
      setEditedStatus(todo.uiStatus || derivedStatus);
      setError('');
    }
  }, [todo, attributes, derivedStatus]);

  // For display purposes - derive status from isCompleted if uiStatus not available
  const displayStatus = todo.uiStatus || derivedStatus;
  
  // Format date for display if needed
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  };

  // Check if due date is in the past
  const isPastDue = () => {
    if (!attributes.dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00
    
    const dueDate = new Date(attributes.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  const handleUpdate = async () => {
    if (!editedTitle.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert plain text description back to rich text format for Strapi 5
      const richTextDescription = plainTextToRichText(editedDescription);
      
      const updatedTodo = await updateTodo(documentId, {
        title: editedTitle,
        description: richTextDescription, // Send as rich text
        priority: editedPriority,
        dueDate: editedDueDate,
        status: editedStatus
      });
      
      onUpdate(updatedTodo);
      setIsEditing(false);
    } catch (error) {
      console.log('Error caught in handleUpdate:', error.message);
      
      if (error.message.includes('not found') || error.message.includes('deleted')) {
        setIsEditing(false);
        setError('This todo no longer exists. It will be removed from your list.');
        setIsDeleting(true);
        
        setTimeout(() => {
          onDelete(documentId);
        }, 3000);
      } else {
        setError(error.message || 'Failed to update. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(documentId);
        onDelete(documentId);
      } catch (error) {
        console.error('Error deleting todo:', error);
        
        if (error.message.includes('not found') || error.response?.status === 404) {
          onDelete(documentId);
        } else {
          setError('Failed to delete todo. Please try again.');
        }
      }
    }
  };

  if (isEditing) {
    return (
      <div className="todo-item editing" id={`todo-item-${documentId}`}>
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="edit-input"
          placeholder="Title"
        />
        
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="edit-textarea"
          placeholder="Description"
        />
        
        <div className="form-group">
          <label>Status</label>
          <select
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            className="edit-select"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Priority</label>
          <select
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value)}
            className="edit-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="edit-input"
          />
        </div>
        
        <div className="button-group">
          <button 
            onClick={handleUpdate} 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={() => setIsEditing(false)} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Priority badge color
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Calculate class for overdue items
  const getOverdueClass = () => {
    if (isOverdue || (isPastDue() && displayStatus !== 'completed')) {
      return 'overdue';
    }
    return '';
  };

  return (
    <div 
      className={`todo-item ${displayStatus} ${getOverdueClass()} ${isDeleting ? 'fading-out' : ''}`}
      id={`todo-item-${documentId}`}
    >
      {error && <div className="error-message">{error}</div>}
      
      <div className="todo-content">
        <h3>{attributes.title || 'Untitled'}</h3>
        
        {/* Display rich text as plain text */}
        <p>{richTextToPlainText(attributes.description)}</p>
        
        <div className="todo-metadata">
          <span className={`todo-status status-${displayStatus}`}>
            {displayStatus === 'completed' ? 'Completed' : 
             displayStatus === 'in-progress' ? 'In Progress' : 'Pending'}
          </span>
          
          {attributes.priority && (
            <span className={`todo-priority ${getPriorityClass(attributes.priority)}`}>
              {attributes.priority}
            </span>
          )}
          
          {attributes.dueDate && (
            <span className={`todo-due-date ${isPastDue() && displayStatus !== 'completed' ? 'overdue-date' : ''}`}>
              Due: {formatDate(attributes.dueDate)}
              {isPastDue() && displayStatus !== 'completed' && ' (Overdue)'}
            </span>
          )}
        </div>
      </div>
      
      <div className="todo-actions">
        <button 
          onClick={() => setIsEditing(true)} 
          className="btn btn-edit"
          disabled={isDeleting}
        >
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          className="btn btn-delete"
          disabled={isDeleting}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem;