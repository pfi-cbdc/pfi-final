import React from 'react';
import { useAuth } from '../context/AuthContext';

const BorrowerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Borrower Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your loans and explore financing options.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card stats-card">
            <h3>Your Loans</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">$0</div>
                <div className="stat-label">Total Borrowed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Active Loans</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$0</div>
                <div className="stat-label">Monthly Payment</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Credit Score</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Your Loan Requests</h3>
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No active loan requests.</p>
              <p className="empty-subtitle">Create a new loan request to get started.</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Payment Schedule</h3>
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No upcoming payments.</p>
              <p className="empty-subtitle">Your payment schedule will appear here.</p>
            </div>
          </div>

          <div className="dashboard-card action-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                <span className="action-icon">💳</span>
                Request New Loan
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">💰</span>
                Make Payment
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">📋</span>
                Loan Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;