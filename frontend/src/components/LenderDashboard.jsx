import React from 'react';
import { useAuth } from '../context/AuthContext';

const LenderDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Lender Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your lending portfolio and explore new opportunities.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card stats-card">
            <h3>Your Portfolio</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">$0</div>
                <div className="stat-label">Total Lent</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Active Loans</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$0</div>
                <div className="stat-label">Interest Earned</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0%</div>
                <div className="stat-label">Default Rate</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Available Loan Requests</h3>
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No loan requests available at the moment.</p>
              <p className="empty-subtitle">Check back later for new opportunities.</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <p>No recent activity.</p>
              <p className="empty-subtitle">Your lending activity will appear here.</p>
            </div>
          </div>

          <div className="dashboard-card action-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                <span className="action-icon">💰</span>
                Browse Loan Requests
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">📊</span>
                View Analytics
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">⚙️</span>
                Lending Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;