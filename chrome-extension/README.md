# PFI Lender Dashboard Chrome Extension

A Chrome extension that provides a quick view of the lender dashboard with borrower information.

## Features

- **Lender Authentication**: Login with email and password
- **Wallet ID Display**: Shows the logged-in lender's wallet ID at the top
- **Borrower List**: Displays all available borrowers with their profiles
- **Risk-Based Color Coding**: Visual indicators for borrower risk levels
- **Comprehensive Info**: Shows credit scores, loan amounts, descriptions, and more

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `chrome-extension` folder
4. The extension will appear in your toolbar

## Usage

1. Click the extension icon in your toolbar
2. Login with your lender credentials
3. View your wallet ID at the top
4. Browse available borrowers with their complete profiles
5. Right-click to logout (optional)

## Borrower Information Displayed

For each borrower, the extension shows:
- Name with risk category badge
- Wallet ID and phone number
- Credit score and app score
- Requested loan amount
- Interest rate offered
- Monthly income range
- Borrower type (Salaried/Self-Employed)
- Personal description

## Risk Categories

- **Green**: Low risk borrowers
- **Yellow**: Medium risk borrowers
- **Red**: High risk borrowers

## Requirements

- Chrome browser
- PFI backend server running on `localhost:5001`
- Valid lender account credentials

## Security

- Uses Chrome's storage API for secure token storage
- Only lenders can access the extension
- Automatic token validation on startup