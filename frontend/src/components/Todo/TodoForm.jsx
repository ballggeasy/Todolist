// src/components/Todo/TodoForm.jsx
import React, { useState } from 'react';
import { createTodo } from '../../services/todo';
import { plainTextToRichText } from '../../utils/richTextHandler';
import './TodoForm.css';

const TodoForm = ({ onTodoAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validate required fields
      if (!title.trim()) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }
      
      // Convert plain text description to rich text format
      const richTextDescription = plainTextToRichText(description);
      
      // Create todo with the data structure that matches Strapi 5
      const response = await createTodo({
        title,
        description: richTextDescription, // Send as rich text
        status, // This will be mapped to isCompleted in the service
        priority, // This will be capitalized in the service
        dueDate: dueDate || undefined
      });
      
      // Pass to parent component
      onTodoAdded(response);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setDueDate('');
    } catch (error) {
      console.error('Error creating todo:', error);
      setError(error.message || 'Failed to create todo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClick = () => {
    window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=Z05jjmad0kalKeG3CMXYvPjw6znLgU5FuZfkaTdSgENUQTM0MzdLSVI2TUpCUFhaS0RIOEVONk0zVC4u', '_blank');
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="todo-input"
        />
      </div>
      
      <div className="form-group">
        <textarea
          placeholder="Add details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="todo-textarea"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="todo-select"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="todo-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="dueDate">Due Date (Optional)</label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="todo-input"
        />
      </div>
      
      <div className="form-buttons">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Todo'}
        </button>
        
        <button 
          type="button" 
          className="btn btn-alert"
          onClick={handleAlertClick}
        >
          Alert
        </button>
      </div>
    </form>
  );
};

export default TodoForm;