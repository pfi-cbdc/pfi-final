import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { lenderAPI, authAPI } from '../services/api';
import './LenderDashboard.css';

const LenderDashboard = () => {
  const { user, updateUser } = useAuth();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [lendModal, setLendModal] = useState({ show: false, borrower: null });
  const [lendAmount, setLendAmount] = useState('');
  const [lendLoading, setLendLoading] = useState(false);
  const [lendMessage, setLendMessage] = useState('');
  const [selectedBorrowers, setSelectedBorrowers] = useState([]);
  const [bulkLendModal, setBulkLendModal] = useState(false);
  const [bulkLendAmounts, setBulkLendAmounts] = useState({});
  const [bulkLendLoading, setBulkLendLoading] = useState(false);
  const [bulkLendMessage, setBulkLendMessage] = useState('');
  const [loadWalletModal, setLoadWalletModal] = useState(false);
  const [loadAmount, setLoadAmount] = useState('');
  const [loadLoading, setLoadLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState('');

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const response = await lenderAPI.getBorrowers();
      setBorrowers(response.data.data);
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

  const handleLendMoney = (borrower) => {
    setLendModal({ show: true, borrower });
    setLendAmount('');
    setLendMessage('');
  };

  const closeLendModal = () => {
    setLendModal({ show: false, borrower: null });
    setLendAmount('');
    setLendMessage('');
  };

  const submitLendMoney = async (e) => {
    e.preventDefault();
    setLendLoading(true);
    setLendMessage('');

    try {
      const response = await lenderAPI.transferMoney(
        lendModal.borrower.walletId,
        parseFloat(lendAmount)
      );

      if (response.data.success) {
        setLendMessage(`Successfully lent ₹${lendAmount} to ${lendModal.borrower.name}`);
        
        // Update user balance in context
        const updatedUser = {
          ...user,
          balance: response.data.data.from.newBalance
        };
        updateUser(updatedUser);
        
        fetchBorrowers(); // Refresh borrowers list
        setTimeout(() => {
          closeLendModal();
        }, 2000);
      }
    } catch (error) {
      setLendMessage(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLendLoading(false);
    }
  };

  const handleBorrowerSelection = (borrower) => {
    setSelectedBorrowers(prev => {
      const isSelected = prev.find(b => b._id === borrower._id);
      if (isSelected) {
        return prev.filter(b => b._id !== borrower._id);
      } else {
        return [...prev, borrower];
      }
    });
  };

  const openBulkLendModal = () => {
    if (selectedBorrowers.length === 0) {
      alert('Please select at least one borrower');
      return;
    }
    setBulkLendModal(true);
    setBulkLendMessage('');
    // Initialize amounts for selected borrowers
    const initialAmounts = {};
    selectedBorrowers.forEach(borrower => {
      initialAmounts[borrower._id] = '';
    });
    setBulkLendAmounts(initialAmounts);
  };

  const closeBulkLendModal = () => {
    setBulkLendModal(false);
    setBulkLendAmounts({});
    setBulkLendMessage('');
  };

  const handleBulkAmountChange = (borrowerId, amount) => {
    setBulkLendAmounts(prev => ({
      ...prev,
      [borrowerId]: amount
    }));
  };

  const submitBulkLend = async (e) => {
    e.preventDefault();
    setBulkLendLoading(true);
    setBulkLendMessage('');

    try {
      const transfers = [];
      let totalAmount = 0;

      // Validate all amounts
      for (const borrower of selectedBorrowers) {
        const amount = parseFloat(bulkLendAmounts[borrower._id]);
        if (!amount || amount <= 0) {
          setBulkLendMessage(`Please enter a valid amount for ${borrower.name}`);
          setBulkLendLoading(false);
          return;
        }
        totalAmount += amount;
        transfers.push({
          borrower: borrower,
          amount: amount
        });
      }

      // Check if lender has sufficient balance
      if (user.balance < totalAmount) {
        setBulkLendMessage(`Insufficient balance. Total needed: ₹${totalAmount}, Available: ₹${user.balance}`);
        setBulkLendLoading(false);
        return;
      }

      // Execute all transfers
      let successCount = 0;
      let newBalance = user.balance;

      for (const transfer of transfers) {
        try {
          const response = await lenderAPI.transferMoney(
            transfer.borrower.walletId,
            transfer.amount
          );
          if (response.data.success) {
            successCount++;
            newBalance = response.data.data.from.newBalance;
          }
        } catch (error) {
          console.error(`Transfer failed for ${transfer.borrower.name}:`, error);
        }
      }

      // Update user balance
      const updatedUser = {
        ...user,
        balance: newBalance
      };
      updateUser(updatedUser);

      setBulkLendMessage(`Successfully lent money to ${successCount}/${transfers.length} borrowers. Total: ₹${totalAmount}`);
      fetchBorrowers(); // Refresh borrowers list
      setSelectedBorrowers([]); // Clear selection

      setTimeout(() => {
        closeBulkLendModal();
      }, 3000);

    } catch (error) {
      setBulkLendMessage('Bulk transfer failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setBulkLendLoading(false);
    }
  };

  const openLoadWalletModal = () => {
    setLoadWalletModal(true);
    setLoadAmount('');
    setLoadMessage('');
  };

  const closeLoadWalletModal = () => {
    setLoadWalletModal(false);
    setLoadAmount('');
    setLoadMessage('');
  };

  const submitLoadWallet = async (e) => {
    e.preventDefault();
    setLoadLoading(true);
    setLoadMessage('');

    try {
      const response = await lenderAPI.loadWallet(parseFloat(loadAmount));

      if (response.data.success) {
        setLoadMessage(`Successfully loaded ₹${loadAmount} to your wallet!`);
        
        // Update user balance in context
        const updatedUser = {
          ...user,
          balance: response.data.data.lender.newBalance
        };
        updateUser(updatedUser);
        
        setTimeout(() => {
          closeLoadWalletModal();
        }, 2000);
      }
    } catch (error) {
      setLoadMessage(error.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoadLoading(false);
    }
  };

  return (
    <div className="lender-dashboard">
      <div className="lender-container">
        <div className="lender-header">
          <h1>Lender Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your lending portfolio and explore new opportunities.</p>
          <div className="wallet-info">
            <div className="wallet-balance">
              <span>Your Balance: {formatCurrency(user?.balance)}</span>
              <button 
                className="load-wallet-btn"
                onClick={openLoadWalletModal}
              >
                Load Wallet
              </button>
            </div>
          </div>
        </div>

        <div className="borrowers-section">
          <div className="borrowers-header">
            <h3>Available Borrowers ({filteredBorrowers.length})</h3>
            <div className="bulk-actions">
              <span>{selectedBorrowers.length} selected</span>
              <button 
                className="bulk-lend-btn"
                onClick={openBulkLendModal}
                disabled={selectedBorrowers.length === 0}
              >
                Lend to Selected ({selectedBorrowers.length})
              </button>
            </div>
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
                  <th>Select</th>
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
                      <input
                        type="checkbox"
                        checked={selectedBorrowers.find(b => b._id === borrower._id) !== undefined}
                        onChange={() => handleBorrowerSelection(borrower)}
                      />
                    </td>
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
                      <button 
                        className="lend-btn"
                        onClick={() => handleLendMoney(borrower)}
                        disabled={!borrower.walletId}
                      >
                        Lend Money
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Lend Money Modal */}
        {lendModal.show && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Lend Money to {lendModal.borrower?.name}</h3>
                <button className="close-btn" onClick={closeLendModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="borrower-info">
                  <p><strong>Email:</strong> {lendModal.borrower?.email}</p>
                  <p><strong>Wallet ID:</strong> {lendModal.borrower?.walletId}</p>
                  <p><strong>Current Balance:</strong> {formatCurrency(lendModal.borrower?.balance)}</p>
                  <p><strong>Interest Rate:</strong> {lendModal.borrower?.borrowerProfile?.rateOfInterest || 'N/A'}%</p>
                </div>
                
                <form onSubmit={submitLendMoney}>
                  <div className="form-group">
                    <label htmlFor="lendAmount">Amount to Lend (₹):</label>
                    <input
                      type="number"
                      id="lendAmount"
                      value={lendAmount}
                      onChange={(e) => setLendAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="lender-info">
                    <p><strong>Your Wallet ID:</strong> {user?.walletId || 'Not Set'}</p>
                    <p><strong>Your Balance:</strong> {formatCurrency(user?.balance)}</p>
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="submit" 
                      className="lend-submit-btn"
                      disabled={lendLoading}
                    >
                      {lendLoading ? 'Processing...' : 'Lend Money'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeLendModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                
                {lendMessage && (
                  <div className={`lend-message ${lendMessage.includes('Successfully') ? 'success' : 'error'}`}>
                    {lendMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Lend Modal */}
        {bulkLendModal && (
          <div className="modal-overlay">
            <div className="modal-content bulk-modal">
              <div className="modal-header">
                <h3>Lend to Multiple Borrowers</h3>
                <button className="close-btn" onClick={closeBulkLendModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="bulk-summary">
                  <p><strong>Selected Borrowers:</strong> {selectedBorrowers.length}</p>
                  <p><strong>Your Balance:</strong> {formatCurrency(user?.balance)}</p>
                </div>
                
                <form onSubmit={submitBulkLend}>
                  <div className="bulk-borrowers-list">
                    {selectedBorrowers.map(borrower => (
                      <div key={borrower._id} className="bulk-borrower-item">
                        <div className="borrower-info">
                          <h4>{borrower.name}</h4>
                          <p>{borrower.email}</p>
                          <p>Wallet: {borrower.walletId}</p>
                          <p>Current Balance: {formatCurrency(borrower.balance)}</p>
                        </div>
                        <div className="amount-input">
                          <label>Amount (₹):</label>
                          <input
                            type="number"
                            value={bulkLendAmounts[borrower._id] || ''}
                            onChange={(e) => handleBulkAmountChange(borrower._id, e.target.value)}
                            placeholder="Enter amount"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="total-amount">
                    <strong>
                      Total Amount: ₹{Object.values(bulkLendAmounts).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0).toFixed(2)}
                    </strong>
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="submit" 
                      className="bulk-submit-btn"
                      disabled={bulkLendLoading}
                    >
                      {bulkLendLoading ? 'Processing...' : 'Lend to All Selected'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeBulkLendModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                
                {bulkLendMessage && (
                  <div className={`bulk-message ${bulkLendMessage.includes('Successfully') ? 'success' : 'error'}`}>
                    {bulkLendMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Load Wallet Modal */}
        {loadWalletModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Load Wallet</h3>
                <button className="close-btn" onClick={closeLoadWalletModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="wallet-load-info">
                  <p><strong>Current Balance:</strong> {formatCurrency(user?.balance)}</p>
                  <p><strong>Source:</strong> Admin Pool Wallet</p>
                  <p className="info-text">💡 Money will be transferred from the admin pool to your wallet</p>
                </div>
                
                <form onSubmit={submitLoadWallet}>
                  <div className="form-group">
                    <label htmlFor="loadAmount">Amount to Load (₹):</label>
                    <input
                      type="number"
                      id="loadAmount"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      placeholder="Enter amount to load"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="submit" 
                      className="load-submit-btn"
                      disabled={loadLoading}
                    >
                      {loadLoading ? 'Loading...' : 'Load Wallet'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeLoadWalletModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                
                {loadMessage && (
                  <div className={`load-message ${loadMessage.includes('Successfully') ? 'success' : 'error'}`}>
                    {loadMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LenderDashboard;