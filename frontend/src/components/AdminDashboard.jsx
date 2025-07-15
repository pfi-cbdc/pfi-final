import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [lenders, setLenders] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferForm, setTransferForm] = useState({
    from: '',
    to: '',
    amount: ''
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLenders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/lenders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLenders(data.data);
      }
    } catch (error) {
      console.error('Error fetching lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/borrowers', {
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

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'lenders') {
      fetchLenders();
    } else if (activeTab === 'borrowers') {
      fetchBorrowers();
    }
  }, [activeTab]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferMessage('');

    try {
      const response = await adminAPI.transferMoney(
        transferForm.from,
        transferForm.to,
        parseFloat(transferForm.amount)
      );

      if (response.data.success) {
        setTransferMessage(`Transfer successful! Amount: ₹${transferForm.amount}`);
        setTransferForm({ from: '', to: '', amount: '' });
        
        // Refresh data based on active tab
        if (activeTab === 'dashboard') {
          fetchStats();
        } else if (activeTab === 'lenders') {
          fetchLenders();
        } else if (activeTab === 'borrowers') {
          fetchBorrowers();
        }
      }
    } catch (error) {
      setTransferMessage(error.response?.data?.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleTransferInputChange = (e) => {
    const { name, value } = e.target;
    setTransferForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>Dashboard Statistics</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Lenders</h3>
            <p className="stat-number">{stats.totalLenders || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Borrowers</h3>
            <p className="stat-number">{stats.totalBorrowers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Users Without Role</h3>
            <p className="stat-number">{stats.usersWithoutRole || 0}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderLenders = () => (
    <div className="admin-lenders">
      <h2>Lenders Management</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Wallet ID</th>
                <th>Balance</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map(lender => (
                <tr key={lender._id}>
                  <td>{lender.name}</td>
                  <td>{lender.email}</td>
                  <td>{lender.phoneNumber || 'N/A'}</td>
                  <td>{lender.walletId || 'N/A'}</td>
                  <td>₹{lender.balance?.toFixed(2) || '0.00'}</td>
                  <td>{new Date(lender.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {lenders.length === 0 && (
            <div className="no-data">No lenders found</div>
          )}
        </div>
      )}
    </div>
  );

  const renderBorrowers = () => (
    <div className="admin-borrowers">
      <h2>Borrowers Management</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Credit Score</th>
                <th>App Score</th>
                <th>Borrower Type</th>
                <th>Monthly Income</th>
                <th>Balance</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.map(borrower => (
                <tr key={borrower._id}>
                  <td>{borrower.name}</td>
                  <td>{borrower.email}</td>
                  <td>{borrower.phoneNumber || 'N/A'}</td>
                  <td>{borrower.borrowerProfile?.creditScore || 'N/A'}</td>
                  <td>{borrower.borrowerProfile?.appScore || 'N/A'}</td>
                  <td>{borrower.borrowerProfile?.borrowerType || 'N/A'}</td>
                  <td>{borrower.borrowerProfile?.monthlyIncome || 'N/A'}</td>
                  <td>₹{borrower.balance?.toFixed(2) || '0.00'}</td>
                  <td>{new Date(borrower.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {borrowers.length === 0 && (
            <div className="no-data">No borrowers found</div>
          )}
        </div>
      )}
    </div>
  );

  const renderTransfer = () => (
    <div className="admin-transfer">
      <h2>Transfer Money</h2>
      <div className="transfer-container">
        <form onSubmit={handleTransfer} className="transfer-form">
          <div className="form-group">
            <label htmlFor="from">From Wallet ID:</label>
            <input
              type="text"
              id="from"
              name="from"
              value={transferForm.from}
              onChange={handleTransferInputChange}
              placeholder="Enter source wallet ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="to">To Wallet ID:</label>
            <input
              type="text"
              id="to"
              name="to"
              value={transferForm.to}
              onChange={handleTransferInputChange}
              placeholder="Enter destination wallet ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount (₹):</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={transferForm.amount}
              onChange={handleTransferInputChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="transfer-btn"
            disabled={transferLoading}
          >
            {transferLoading ? 'Processing...' : 'Transfer Money'}
          </button>
        </form>
        
        {transferMessage && (
          <div className={`transfer-message ${transferMessage.includes('successful') ? 'success' : 'error'}`}>
            {transferMessage}
          </div>
        )}
        
        <div className="transfer-info">
          <h3>Transfer Instructions</h3>
          <ul>
            <li>Enter the source wallet ID (from where money will be deducted)</li>
            <li>Enter the destination wallet ID (where money will be credited)</li>
            <li>Enter the amount to transfer</li>
            <li>Ensure sufficient balance in source wallet</li>
            <li>Admin wallet ID: {user?.walletId || 'Not Set'}</li>
            <li>Admin balance: ₹{user?.balance?.toFixed(2) || '0.00'}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-user-info">
          <span>Welcome, {user?.name}</span>
          <span className="admin-badge">Admin</span>
        </div>
      </div>

      <div className="admin-wallet-info">
        <div className="wallet-card">
          <h3>Pool Wallet Information</h3>
          <div className="wallet-details">
            <div className="wallet-item">
              <span className="wallet-label">Wallet ID:</span>
              <span className="wallet-value">{user?.walletId || 'Not Set'}</span>
            </div>
            <div className="wallet-item">
              <span className="wallet-label">Balance:</span>
              <span className="wallet-value">₹{user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="wallet-item">
              <span className="wallet-label">Email:</span>
              <span className="wallet-value">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'lenders' ? 'active' : ''}
          onClick={() => setActiveTab('lenders')}
        >
          Lenders
        </button>
        <button 
          className={activeTab === 'borrowers' ? 'active' : ''}
          onClick={() => setActiveTab('borrowers')}
        >
          Borrowers
        </button>
        <button 
          className={activeTab === 'transfer' ? 'active' : ''}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer Money
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'lenders' && renderLenders()}
        {activeTab === 'borrowers' && renderBorrowers()}
        {activeTab === 'transfer' && renderTransfer()}
      </div>
    </div>
  );
};

export default AdminDashboard;