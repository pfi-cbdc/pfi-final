import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleSelection from './RoleSelection';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleChangeRole = () => {
    setShowRoleSelection(true);
  };

  const handleRoleSelected = () => {
    setShowRoleSelection(false);
  };

  if (showRoleSelection) {
    return <RoleSelection onRoleSelected={handleRoleSelected} />;
  }

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Welcome to Dashboard</h1>
        
        <div className="user-info">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p>
            <strong>Role:</strong> {' '}
            {user?.role ? (
              <span className={`role-badge role-${user.role}`}>
                {user.role}
              </span>
            ) : (
              'Not selected'
            )}
          </p>
        </div>

        {!user?.role && (
          <div className="role-prompt">
            <p>Please select your role to continue:</p>
            <button onClick={handleChangeRole} className="change-role-btn">
              Select Role
            </button>
          </div>
        )}

        {user?.role && (
          <div className="role-actions">
            <button onClick={handleChangeRole} className="change-role-btn">
              Change Role
            </button>
          </div>
        )}
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;