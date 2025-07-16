const API_BASE_URL = 'http://localhost:5001/api';

document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('email').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
});

async function checkLoginStatus() {
    try {
        const result = await chrome.storage.local.get(['authToken', 'userInfo']);
        
        if (result.authToken && result.userInfo) {
            // Verify token is still valid
            const response = await fetch(`${API_BASE_URL}/lender/profile`, {
                headers: {
                    'Authorization': `Bearer ${result.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                showDashboard(data.user);
                loadBorrowers(result.authToken);
            } else {
                showLogin();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        showLogin();
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    try {
        // Login
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            showError(loginData.message || 'Login failed');
            return;
        }
        
        // Check if user is a lender
        if (loginData.user.role !== 'lender') {
            showError('Access denied. Only lenders can use this extension.');
            return;
        }
        
        // Store auth info
        await chrome.storage.local.set({
            authToken: loginData.token,
            userInfo: loginData.user
        });
        
        showDashboard(loginData.user);
        loadBorrowers(loginData.token);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    }
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
}

function showDashboard(user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('walletId').textContent = user.walletId || 'Not Set';
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

async function loadBorrowers(token) {
    const borrowersList = document.getElementById('borrowersList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/lender/borrowers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load borrowers');
        }
        
        const data = await response.json();
        displayBorrowers(data.data);
        
    } catch (error) {
        console.error('Error loading borrowers:', error);
        borrowersList.innerHTML = '<div class="error">Failed to load borrowers</div>';
    }
}

function displayBorrowers(borrowers) {
    const borrowersList = document.getElementById('borrowersList');
    
    if (!borrowers || borrowers.length === 0) {
        borrowersList.innerHTML = '<div class="error">No borrowers available</div>';
        return;
    }
    
    borrowersList.innerHTML = borrowers.map(borrower => {
        const riskClass = borrower.borrowerProfile?.riskCategory?.toLowerCase() || 'low';
        const riskColor = riskClass === 'low' ? 'risk-low' : riskClass === 'medium' ? 'risk-medium' : 'risk-high';
        
        return `
            <div class="borrower-card ${riskClass}-risk">
                <div class="borrower-name">
                    ${borrower.name}
                    <span class="risk-badge ${riskColor}">${borrower.borrowerProfile?.riskCategory || 'Low'}</span>
                </div>
                <div class="borrower-details">
                    <div><strong>Wallet:</strong> ${borrower.walletId || 'Not Set'}</div>
                    <div><strong>Phone:</strong> ${borrower.phoneNumber || 'Not Set'}</div>
                    <div><strong>Credit Score:</strong> ${borrower.borrowerProfile?.creditScore || 'N/A'}</div>
                    <div><strong>App Score:</strong> ${borrower.borrowerProfile?.appScore || 'N/A'}</div>
                    <div><strong>Loan Amount:</strong> ₹${borrower.borrowerProfile?.loanAmount || 'Not specified'}</div>
                    <div><strong>Interest Rate:</strong> ${borrower.borrowerProfile?.rateOfInterest || 'N/A'}%</div>
                    <div><strong>Income:</strong> ₹${borrower.borrowerProfile?.monthlyIncome || 'Not specified'}</div>
                    <div><strong>Type:</strong> ${borrower.borrowerProfile?.borrowerType || 'Not specified'}</div>
                    ${borrower.borrowerProfile?.description ? `<div><strong>Description:</strong> ${borrower.borrowerProfile.description}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Add logout functionality (optional)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (confirm('Logout from PFI Lender Dashboard?')) {
        chrome.storage.local.clear();
        showLogin();
    }
});