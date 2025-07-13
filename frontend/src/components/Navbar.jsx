import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onAuthToggle }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setShowAuthOptions(false);
    navigate('/auth');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowAuthOptions(false);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setShowAuthOptions(!showAuthOptions);
    } else {
      navigate('/auth');
    }
  };

  const handleBrandClick = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
        <h2>PFI App</h2>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <div className="navbar-user">
            <button onClick={handleProfileClick} className="profile-btn" title="Profile">
              <div className="profile-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
            </button>
            
            <div className="user-menu">
              <button onClick={handleAuthClick} className="user-menu-btn">
                <div className="user-profile-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showAuthOptions && (
                <div className="dropdown-menu">
                  <button onClick={handleProfileClick} className="dropdown-item">
                    Profile
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button onClick={handleAuthClick} className="login-btn">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;