// src/components/Auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Monitor password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check (8+ characters)
    if (password.length >= 8) strength += 1;
    
    // Case check (upper and lower)
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    
    // Numeric check
    if (/[0-9]/.test(password)) strength += 1;
    
    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthText = () => {
    if (!password) return '';
    const texts = ['Very Weak', 'Weak', 'Medium', 'Good', 'Strong'];
    return texts[passwordStrength];
  };

  const getStrengthColor = () => {
    if (!password) return '#ddd';
    const colors = ['#dc3545', '#ffc107', '#6c757d', '#28a745', '#20c997'];
    return colors[passwordStrength];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate inputs
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (passwordStrength < 2) {
      setError('Please use a stronger password');
      setIsSubmitting(false);
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms of service and privacy policy');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(username, email, password);
      if (result.success) {
        navigate('/todos');
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="auth-card">
        {/* Left Panel - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <h2 className="brand-tagline">Start organizing your tasks today</h2>
            <p className="brand-subtext">Join thousands of users who trust TodoApp for their daily task management</p>
          </div>
          <div className="decorative-circle"></div>
        </div>
        
        {/* Right Panel - Form */}
        <div className="auth-form-container">
          <h1 className="auth-form-title">Create Account</h1>
          <p className="auth-form-subtitle">Fill in your details to get started</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
              {password && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div
                      className="strength-meter-fill"
                      style={{
                        width: `${(passwordStrength + 1) * 20}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  <div className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <div className="password-match-error">Passwords do not match</div>
              )}
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <label htmlFor="agreeTerms">
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-alternative">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;