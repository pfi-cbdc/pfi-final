import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const RoleSelection = ({ onRoleSelected }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser } = useAuth();

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.updateRole(selectedRole);
      setUser(response.data.user);
      onRoleSelected();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="role-selection">
        <h2>Choose Your Role</h2>
        <p>Please select whether you want to be a lender or borrower:</p>
        
        <form onSubmit={handleRoleSubmit}>
          <div className="role-options">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="lender"
                checked={selectedRole === 'lender'}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              <div className="role-card">
                <h3>Lender</h3>
                <p>Provide loans to borrowers and earn interest</p>
              </div>
            </label>

            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="borrower"
                checked={selectedRole === 'borrower'}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
              <div className="role-card">
                <h3>Borrower</h3>
                <p>Request loans from lenders for your needs</p>
              </div>
            </label>
          </div>

          <button type="submit" disabled={loading || !selectedRole}>
            {loading ? 'Setting Role...' : 'Confirm Role'}
          </button>

          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default RoleSelection;