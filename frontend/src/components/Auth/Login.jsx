import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const { email, password } = formData;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
  
  // Form validation
  const getFieldError = (field) => {
    if (!touched[field]) return '';
    
    const value = formData[field];
    
    if (!value) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
    }
    
    return '';
  };
  
  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');
  const isFormValid = !emailError && !passwordError && email && password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Mark all fields as touched to show errors
    setTouched({
      email: true,
      password: true
    });
    
    // Check if form is valid
    if (!isFormValid) {
      setError('Please fix the form errors before submitting.');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
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
        <h2>Login to Your Account</h2>
        {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
            />
            {touched.email && emailError && (
              <p id="email-error" className="error-text">{emailError}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={touched.password && passwordError ? 'input-error' : ''}
              aria-invalid={touched.password && !!passwordError}
              aria-describedby={touched.password && passwordError ? 'password-error' : undefined}
              disabled={isLoading}
            />
            {touched.password && passwordError && (
              <p id="password-error" className="error-text">{passwordError}</p>
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
                <span>Logging in...</span>
              </>
            ) : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
