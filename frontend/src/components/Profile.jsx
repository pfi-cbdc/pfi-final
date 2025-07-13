import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleSelection from './RoleSelection';

const Profile = () => {
  const { user } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

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
    <div className="profile-page">
      <div className="container">
        <h1>Profile Details</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-row">
              <label>Full Name:</label>
              <span>{user?.name}</span>
            </div>
            
            <div className="detail-row">
              <label>Email Address:</label>
              <span>{user?.email}</span>
            </div>
            
            <div className="detail-row">
              <label>User ID:</label>
              <span>{user?.id}</span>
            </div>
            
            <div className="detail-row">
              <label>Role:</label>
              <span>
                {user?.role ? (
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                ) : (
                  <span className="no-role">Not selected</span>
                )}
              </span>
            </div>
            
            <div className="detail-row">
              <label>Member Since:</label>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            {!user?.role ? (
              <button onClick={handleChangeRole} className="primary-btn">
                Select Role
              </button>
            ) : (
              <button onClick={handleChangeRole} className="secondary-btn">
                Change Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;