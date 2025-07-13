import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const AuthWrapper = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  if (loading) {
    return (
      <>
        <Navbar onAuthToggle={handleAuthToggle} />
        <div className="container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            Loading...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar onAuthToggle={handleAuthToggle} />
      
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : showLogin ? (
              <Login onSwitchToRegister={() => setShowLogin(false)} />
            ) : (
              <Register onSwitchToLogin={() => setShowLogin(true)} />
            )
          } 
        />
      </Routes>

      {!isAuthenticated && showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn" 
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>
            {showLogin ? (
              <Login onSwitchToRegister={() => setShowLogin(false)} />
            ) : (
              <Register onSwitchToLogin={() => setShowLogin(true)} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;