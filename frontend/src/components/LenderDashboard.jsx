import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LenderDashboard.css';

const LenderDashboard = () => {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lender/borrowers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBorrowers(data.data);
      }
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCreditScoreClass = (score) => {
    if (score >= 750) return 'excellent';
    if (score >= 700) return 'good';
    if (score >= 650) return 'fair';
    return 'poor';
  };

  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrower.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       borrower.borrowerProfile?.borrowerType === filterType;
    
    const matchesRisk = filterRisk === 'all' || 
                       borrower.borrowerProfile?.riskCategory === filterRisk;

    return matchesSearch && matchesType && matchesRisk;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="lender-dashboard">
      <div className="lender-container">
        <div className="lender-header">
          <h1>Lender Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your lending portfolio and explore new opportunities.</p>
        </div>

        <div className="lender-wallet-info">
          <h3>Your Wallet Information</h3>
          <div className="wallet-info-grid">
            <div className="wallet-info-item">
              <div className="wallet-info-label">Wallet ID</div>
              <div className="wallet-info-value">{user?.walletId || 'Not Set'}</div>
            </div>
            <div className="wallet-info-item">
              <div className="wallet-info-label">Available Balance</div>
              <div className="wallet-info-value">{formatCurrency(user?.balance)}</div>
            </div>
            <div className="wallet-info-item">
              <div className="wallet-info-label">Email</div>
              <div className="wallet-info-value">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="lender-stats">
          <h3>Your Portfolio</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">₹0</div>
              <div className="stat-label">Total Lent</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Active Loans</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">₹0</div>
              <div className="stat-label">Interest Earned</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0%</div>
              <div className="stat-label">Default Rate</div>
            </div>
          </div>
        </div>

        <div className="borrowers-section">
          <div className="borrowers-header">
            <h3>Available Borrowers ({filteredBorrowers.length})</h3>
          </div>

          <div className="borrowers-filters">
            <input
              type="text"
              placeholder="Search borrowers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="prime">Prime</option>
              <option value="near-prime">Near Prime</option>
              <option value="subprime">Subprime</option>
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading borrowers...</div>
          ) : filteredBorrowers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-message">No borrowers found</div>
              <div className="empty-subtitle">Try adjusting your search or filter criteria</div>
            </div>
          ) : (
            <table className="borrowers-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Wallet ID</th>
                  <th>Credit Score</th>
                  <th>App Score</th>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Monthly Income</th>
                  <th>Balance</th>
                  <th>Interest Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrowers.map(borrower => (
                  <tr key={borrower._id}>
                    <td>
                      <div className="borrower-name">{borrower.name}</div>
                      <div className="borrower-email">{borrower.email}</div>
                    </td>
                    <td>
                      <span className="wallet-id">
                        {borrower.walletId || 'Not Set'}
                      </span>
                    </td>
                    <td>
                      <span className={`credit-score ${getCreditScoreClass(borrower.borrowerProfile?.creditScore)}`}>
                        {borrower.borrowerProfile?.creditScore || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`credit-score ${getCreditScoreClass(borrower.borrowerProfile?.appScore)}`}>
                        {borrower.borrowerProfile?.appScore || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`borrower-type ${borrower.borrowerProfile?.borrowerType || 'prime'}`}>
                        {borrower.borrowerProfile?.borrowerType || 'Prime'}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-category ${borrower.borrowerProfile?.riskCategory || 'low'}`}>
                        {borrower.borrowerProfile?.riskCategory || 'Low'}
                      </span>
                    </td>
                    <td>
                      {formatCurrency(borrower.borrowerProfile?.monthlyIncome)}
                    </td>
                    <td>
                      <span className="balance-amount">
                        {formatCurrency(borrower.balance)}
                      </span>
                    </td>
                    <td>
                      {borrower.borrowerProfile?.rateOfInterest || 'N/A'}%
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn primary">
                          View Details
                        </button>
                        <button className="action-btn secondary">
                          Send Offer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <span className="quick-action-icon">📊</span>
              View Analytics
            </button>
            <button className="quick-action-btn">
              <span className="quick-action-icon">⚙️</span>
              Lending Preferences
            </button>
            <button className="quick-action-btn">
              <span className="quick-action-icon">📈</span>
              Portfolio Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;