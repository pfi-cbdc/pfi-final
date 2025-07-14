import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleSelection from './RoleSelection';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    phoneNumber: user?.phoneNumber || '',
    walletId: user?.walletId || ''
  });
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    walletId: user?.walletId || '',
    creditScore: user?.borrowerProfile?.creditScore || '',
    appScore: user?.borrowerProfile?.appScore || '',
    loanTenure: user?.borrowerProfile?.loanTenure || '',
    rateOfInterest: user?.borrowerProfile?.rateOfInterest || '',
    repaymentType: user?.borrowerProfile?.repaymentType || '',
    riskCategory: user?.borrowerProfile?.riskCategory || '',
    borrowerType: user?.borrowerProfile?.borrowerType || '',
    monthlyIncome: user?.borrowerProfile?.monthlyIncome || '',
    loanAmount: user?.borrowerProfile?.loanAmount || ''
  });

  const handleChangeRole = () => {
    setShowRoleSelection(true);
  };

  const handleRoleSelected = () => {
    setShowRoleSelection(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileEditToggle = () => {
    setIsEditingProfile(!isEditingProfile);
    if (!isEditingProfile) {
      setProfileData({
        phoneNumber: user?.phoneNumber || '',
        walletId: user?.walletId || ''
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setIsEditingProfile(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormData({
        phoneNumber: user?.phoneNumber || '',
        walletId: user?.walletId || '',
        creditScore: user?.borrowerProfile?.creditScore || '',
        appScore: user?.borrowerProfile?.appScore || '',
        loanTenure: user?.borrowerProfile?.loanTenure || '',
        rateOfInterest: user?.borrowerProfile?.rateOfInterest || '',
        repaymentType: user?.borrowerProfile?.repaymentType || '',
        riskCategory: user?.borrowerProfile?.riskCategory || '',
        borrowerType: user?.borrowerProfile?.borrowerType || '',
        monthlyIncome: user?.borrowerProfile?.monthlyIncome || '',
        loanAmount: user?.borrowerProfile?.loanAmount || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/borrower/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
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
            
            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                <div className="detail-row">
                  <label>Phone Number:</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleProfileInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="detail-row">
                  <label>Wallet ID:</label>
                  <input
                    type="text"
                    name="walletId"
                    value={profileData.walletId}
                    onChange={handleProfileInputChange}
                    placeholder="Enter wallet ID"
                  />
                </div>
                
                <div className="detail-row">
                  <label>Balance:</label>
                  <span>₹{user?.balance?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="detail-row">
                  <label>Member Since:</label>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="profile-edit-actions">
                  <button type="submit" className="primary-btn">
                    Save Changes
                  </button>
                  <button type="button" onClick={handleProfileEditToggle} className="secondary-btn">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="detail-row">
                  <label>Phone Number:</label>
                  <span>{user?.phoneNumber || 'Not provided'}</span>
                </div>
                
                <div className="detail-row">
                  <label>Wallet ID:</label>
                  <span>{user?.walletId || 'Not assigned'}</span>
                </div>
                
                <div className="detail-row">
                  <label>Balance:</label>
                  <span>₹{user?.balance?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="detail-row">
                  <label>Member Since:</label>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="profile-edit-actions">
                  <button onClick={handleProfileEditToggle} className="edit-btn">
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>

          {user?.role === 'borrower' && (
            <div className="borrower-profile">
              <div className="section-header">
                <h3>Borrower Profile</h3>
                <button onClick={handleEditToggle} className="edit-btn">
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="borrower-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Phone Number:</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Wallet ID:</label>
                      <input
                        type="text"
                        name="walletId"
                        value={formData.walletId}
                        onChange={handleInputChange}
                        placeholder="Enter wallet ID"
                      />
                    </div>

                    <div className="form-group">
                      <label>Credit Score (600-900):</label>
                      <input
                        type="number"
                        name="creditScore"
                        value={formData.creditScore}
                        onChange={handleInputChange}
                        min="600"
                        max="900"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>App Score (700-900):</label>
                      <input
                        type="number"
                        name="appScore"
                        value={formData.appScore}
                        onChange={handleInputChange}
                        min="700"
                        max="900"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Loan Tenure:</label>
                      <select
                        name="loanTenure"
                        value={formData.loanTenure}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Tenure</option>
                        <option value="1M">1 Month</option>
                        <option value="3M">3 Months</option>
                        <option value="6M">6 Months</option>
                        <option value="9M">9 Months</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Rate of Interest (%):</label>
                      <select
                        name="rateOfInterest"
                        value={formData.rateOfInterest}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Rate</option>
                        <option value="12">12%</option>
                        <option value="24">24%</option>
                        <option value="36">36%</option>
                        <option value="48">48%</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Repayment Type:</label>
                      <select
                        name="repaymentType"
                        value={formData.repaymentType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Risk Category:</label>
                      <select
                        name="riskCategory"
                        value={formData.riskCategory}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Borrower Type:</label>
                      <select
                        name="borrowerType"
                        value={formData.borrowerType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Salaried">Salaried</option>
                        <option value="SelfEmployed">Self Employed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Monthly Income:</label>
                      <select
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Income Range</option>
                        <option value="Upto 25000">Up to ₹25,000</option>
                        <option value="25000-50000">₹25,000 - ₹50,000</option>
                        <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                        <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Loan Amount:</label>
                      <select
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Amount</option>
                        <option value="Upto 25000">Up to ₹25,000</option>
                        <option value="25000-50000">₹25,000 - ₹50,000</option>
                        <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary-btn">
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="borrower-details">
                  <div className="detail-grid">
                    <div className="detail-row">
                      <label>Phone Number:</label>
                      <span>{user?.phoneNumber || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Wallet ID:</label>
                      <span>{user?.walletId || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Credit Score:</label>
                      <span>{user?.borrowerProfile?.creditScore || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>App Score:</label>
                      <span>{user?.borrowerProfile?.appScore || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Loan Tenure:</label>
                      <span>{user?.borrowerProfile?.loanTenure || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Rate of Interest:</label>
                      <span>{user?.borrowerProfile?.rateOfInterest ? `${user.borrowerProfile.rateOfInterest}%` : 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Repayment Type:</label>
                      <span>{user?.borrowerProfile?.repaymentType || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Risk Category:</label>
                      <span>{user?.borrowerProfile?.riskCategory || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Borrower Type:</label>
                      <span>{user?.borrowerProfile?.borrowerType || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Monthly Income:</label>
                      <span>{user?.borrowerProfile?.monthlyIncome || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Loan Amount:</label>
                      <span>{user?.borrowerProfile?.loanAmount || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
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