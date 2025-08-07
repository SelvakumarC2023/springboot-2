import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  const { name, email, password, confirmPassword } = formData;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Field validation
  const getFieldError = (field, value) => {
    if (!touched[field]) return '';
    
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${field === 'confirmPassword' ? 'Confirm ' : ''}${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
    }
    
    if (field === 'password') {
      if (value.length < 6) return 'Password must be at least 6 characters';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }
    
    if (field === 'confirmPassword' && value !== password) {
      return 'Passwords do not match';
    }
    
    return '';
  };
  
  const nameError = getFieldError('name', name);
  const emailError = getFieldError('email', email);
  const passwordError = getFieldError('password', password);
  const confirmPasswordError = getFieldError('confirmPassword', confirmPassword);
  
  const isFormValid = !nameError && !emailError && !passwordError && !confirmPasswordError && 
                    name && email && password && confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    // Check if form is valid
    if (!isFormValid) {
      setError('Please fix the form errors before submitting.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await register({ name, email, password });
      if (!result.success) {
        setError(result.message || 'Failed to create account. Please try again.');
      } else {
        navigate('/login', { 
          state: { 
            success: 'Registration successful! Please log in to continue.' 
          },
          replace: true
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Unable to connect to the server. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              className={touched.name && nameError ? 'input-error' : ''}
              aria-invalid={touched.name && !!nameError}
              aria-describedby={touched.name && nameError ? 'name-error' : undefined}
              disabled={isLoading}
              autoComplete="name"
              autoFocus
            />
            {touched.name && nameError && (
              <p id="name-error" className="error-text">{nameError}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className={touched.email && emailError ? 'input-error' : ''}
              aria-invalid={touched.email && !!emailError}
              aria-describedby={touched.email && emailError ? 'email-error' : undefined}
              disabled={isLoading}
              autoComplete="email"
            />
            {touched.email && emailError && (
              <p id="email-error" className="error-text">{emailError}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a password (min 6 characters)"
                className={touched.password && passwordError ? 'input-error' : ''}
                aria-invalid={touched.password && !!passwordError}
                aria-describedby={touched.password && passwordError ? 'password-error' : undefined}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            {touched.password && passwordError && (
              <p id="password-error" className="error-text">{passwordError}</p>
            )}
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={password.length >= 6 ? 'valid' : ''}>At least 6 characters</li>
                <li className={/(?=.*[a-z])/.test(password) ? 'valid' : ''}>One lowercase letter</li>
                <li className={/(?=.*[A-Z])/.test(password) ? 'valid' : ''}>One uppercase letter</li>
                <li className={/(?=.*\d)/.test(password) ? 'valid' : ''}>One number</li>
              </ul>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                className={touched.confirmPassword && confirmPasswordError ? 'input-error' : ''}
                aria-invalid={touched.confirmPassword && !!confirmPasswordError}
                aria-describedby={touched.confirmPassword && confirmPasswordError ? 'confirm-password-error' : undefined}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            {touched.confirmPassword && confirmPasswordError && (
              <p id="confirm-password-error" className="error-text">{confirmPasswordError}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !isFormValid}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Creating Account...</span>
              </>
            ) : 'Sign Up'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </div>
        <div className="terms-notice">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}

export default Signup;
