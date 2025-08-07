import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserID.css';

function UserID() {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get the login function from the parent component
  const { login } = window.useSimpleAuth ? window.useSimpleAuth() : { login: null };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, you would validate the user ID with a backend service here
      // For now, we'll simulate a network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the login function from useSimpleAuth
      if (login) {
        login(userId.trim());
      } else {
        // Fallback in case the hook isn't available
        localStorage.setItem('userId', userId.trim());
      }
      
      // Navigate to the main app
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-id-container">
      <div className="user-id-card">
        <h2>Enter Your User ID</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="user-id-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your unique user ID"
              className={error ? 'input-error' : ''}
              aria-invalid={!!error}
              aria-describedby={error ? 'user-id-error' : undefined}
              autoFocus
            />
            {error && <p id="user-id-error" className="error-text">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Verifying...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
        
        <div className="user-id-help">
          <p>Don't have a user ID? <a href="#" onClick={(e) => {
            e.preventDefault();
            alert('Please contact support at support@example.com to get a user ID.');
          }}>Contact support</a> to get one.</p>
        </div>
      </div>
    </div>
  );
}

export default UserID;
