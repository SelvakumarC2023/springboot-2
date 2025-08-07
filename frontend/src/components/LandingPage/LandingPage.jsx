import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">Budget Tracker</div>
        <div className="nav-links">
          <Link to="/login" className="nav-button">Login</Link>
          <Link to="/signup" className="nav-button signup">Sign Up</Link>
        </div>
      </nav>

      <main className="landing-main">
        <div className="hero-section">
          <h1>Your Professional Budget Management Tool</h1>
          <p>Track your Daily & Monthly and Yearly finances with ease</p>
          <Link to="/signup" className="cta-button">Get Started Free</Link>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <i className="fas fa-chart-line"></i>
            <h3>Track Income & Expenses</h3>
            <p>Monitor your financial flow with detailed tracking</p>
          </div>

          <div className="feature-card">
            <i className="fas fa-calendar-alt"></i>
            <h3>Monthly & Daily Analysis</h3>
            <p>View detailed monthly and daily budget breakdowns</p>
          </div>

          <div className="feature-card">
            <i className="fas fa-chart-pie"></i>
            <h3>Yearly Overview</h3>
            <p>Analyze your yearly financial patterns</p>
          </div>

          <div className="feature-card">
            <i className="fas fa-chart-pie"></i>
            <h3>PDF Download</h3>
            <p>We can download the overall summary report</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;  