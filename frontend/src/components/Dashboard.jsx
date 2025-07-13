import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleSelection from './RoleSelection';
import LenderDashboard from './LenderDashboard';
import BorrowerDashboard from './BorrowerDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleRoleSelected = () => {
    setShowRoleSelection(false);
  };

  // If user has no role, show role selection
  if (!user?.role) {
    return <RoleSelection onRoleSelected={handleRoleSelected} />;
  }

  // If user wants to change role, show role selection
  if (showRoleSelection) {
    return <RoleSelection onRoleSelected={handleRoleSelected} />;
  }

  // Route to appropriate dashboard based on role
  if (user.role === 'lender') {
    return <LenderDashboard />;
  }

  if (user.role === 'borrower') {
    return <BorrowerDashboard />;
  }

  // Fallback (shouldn't reach here)
  return <RoleSelection onRoleSelected={handleRoleSelected} />;
};

export default Dashboard;