// src/components/Todo/TodoList.jsx
import React, { useState, useEffect } from 'react';
import { getTodos } from '../../services/todo';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'completed', 'overdue'
  
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await getTodos();
      
      // Extract and process the todo items correctly
      const todoItems = response.data ? response.data : 
                      (Array.isArray(response) ? response : []);
      
      setTodos(todoItems);
      setError('');
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleTodoAdded = (newTodo) => {
    const todoItem = newTodo.data ? newTodo.data : newTodo;
    setTodos(prevTodos => [todoItem, ...prevTodos]);
  };

  const handleTodoUpdated = (updatedTodo) => {
    const todoItem = updatedTodo.data ? updatedTodo.data : updatedTodo;
    
    setTodos(prevTodos => prevTodos.map(todo => {
      const todoId = todo.documentId || todo.id;
      const updatedId = todoItem.documentId || todoItem.id;
      return todoId === updatedId ? todoItem : todo;
    }));
  };

  const handleTodoDeleted = (todoId) => {
    setTodos(prevTodos => prevTodos.filter(todo => {
      const currentId = todo.documentId || todo.id;
      return currentId !== todoId;
    }));
  };

  // Function to check if a todo is overdue
  const isOverdue = (todo) => {
    const attributes = todo.attributes || todo;
    if (!attributes.dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00
    
    const dueDate = new Date(attributes.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  // Filter todos based on filterMode
  const getFilteredTodos = () => {
    return todos.filter(todo => {
      const attributes = todo.attributes || todo;
      const status = attributes.isCompleted ? 'completed' : 
                    (todo.uiStatus === 'in-progress' ? 'in-progress' : 'pending');
      
      switch (filterMode) {
        case 'completed':
          return status === 'completed';
        case 'active':
          return status !== 'completed';
        case 'overdue':
          return status !== 'completed' && isOverdue(todo);
        default:
          return true; // Show all
      }
    });
  };

  // Separate Todo lists by status and due date
  const getCompletedTodos = () => {
    return todos.filter(todo => {
      const attributes = todo.attributes || todo;
      return attributes.isCompleted;
    });
  };

  const getActiveTodos = () => {
    return todos.filter(todo => {
      const attributes = todo.attributes || todo;
      return !attributes.isCompleted;
    });
  };

  const getOverdueTodos = () => {
    return todos.filter(todo => {
      const attributes = todo.attributes || todo;
      return !attributes.isCompleted && isOverdue(todo);
    });
  };

  if (loading) {
    return <div className="loading">Loading your todos...</div>;
  }

  // Count items in each category
  const activeTodosCount = getActiveTodos().length;
  const completedTodosCount = getCompletedTodos().length;
  const overdueTodosCount = getOverdueTodos().length;

  const filteredTodos = getFilteredTodos();

  return (
    <div className="todo-container">
      <h1>My Todo List</h1>
      
      {error && <div className="error-message global-error">{error}</div>}
      
      <TodoForm onTodoAdded={handleTodoAdded} />
      
      <div className="todo-filters">
        <button 
          onClick={() => setFilterMode('all')} 
          className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
        >
          All ({todos.length})
        </button>
        <button 
          onClick={() => setFilterMode('active')} 
          className={`filter-btn ${filterMode === 'active' ? 'active' : ''}`}
        >
          Active ({activeTodosCount})
        </button>
        <button 
          onClick={() => setFilterMode('completed')} 
          className={`filter-btn ${filterMode === 'completed' ? 'active' : ''}`}
        >
          Completed ({completedTodosCount})
        </button>
        <button 
          onClick={() => setFilterMode('overdue')} 
          className={`filter-btn ${filterMode === 'overdue' ? 'active' : ''} ${overdueTodosCount > 0 ? 'overdue-alert' : ''}`}
        >
          Overdue ({overdueTodosCount})
        </button>
      </div>
      
      <div className="todo-controls">
        <button onClick={fetchTodos} className="btn btn-refresh">
          Refresh
        </button>
      </div>
      
      {/* Show overdue items first (only when viewing all or active items) */}
      {(filterMode === 'all' || filterMode === 'active') && overdueTodosCount > 0 && (
        <div className="overdue-section">
          <h2 className="section-title overdue-title">Overdue Items ({overdueTodosCount})</h2>
          <div className="todo-list">
            {getOverdueTodos().map(todo => (
              <TodoItem
                key={todo.documentId || todo.id || Math.random()}
                todo={{...todo, isOverdue: true}}
                onUpdate={handleTodoUpdated}
                onDelete={handleTodoDeleted}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Show filtered todos */}
      <div className="todo-section">
        <h2 className="section-title">
          {filterMode === 'all' && 'All Items'}
          {filterMode === 'active' && 'Active Items'}
          {filterMode === 'completed' && 'Completed Items'}
          {filterMode === 'overdue' && 'Overdue Items'}
          {filterMode === 'all' && ` (${todos.length})`}
          {filterMode === 'active' && ` (${activeTodosCount})`}
          {filterMode === 'completed' && ` (${completedTodosCount})`}
          {filterMode === 'overdue' && ` (${overdueTodosCount})`}
        </h2>
        
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="no-todos">
              {filterMode === 'all' && 'No todos yet. Create your first todo!'}
              {filterMode === 'active' && 'No active todos'}
              {filterMode === 'completed' && 'No completed todos'}
              {filterMode === 'overdue' && 'No overdue todos'}
            </div>
          ) : (
            filteredTodos
              // Sort by priority or due date
              .sort((a, b) => {
                const aAttrs = a.attributes || a;
                const bAttrs = b.attributes || b;
                
                // For overdue view, sort by due date (oldest first)
                if (filterMode === 'overdue') {
                  return new Date(aAttrs.dueDate) - new Date(bAttrs.dueDate);
                }
                
                // Otherwise, sort by priority
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                const aPriority = priorityOrder[aAttrs.priority] || 0;
                const bPriority = priorityOrder[bAttrs.priority] || 0;
                
                return bPriority - aPriority;
              })
              .map(todo => (
                <TodoItem
                  key={todo.documentId || todo.id || Math.random()}
                  todo={{...todo, isOverdue: isOverdue(todo) && !todo.attributes?.isCompleted}}
                  onUpdate={handleTodoUpdated}
                  onDelete={handleTodoDeleted}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;