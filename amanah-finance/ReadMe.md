# Amanah Finance - Shariah-Compliant Microfinance Management System

## Overview
Amanah Finance is a JavaScript-rich web application for managing Islamic microfinance operations. It helps users track clients, create and manage contracts, post payments, monitor overdue installments, and view reporting insights through charts and summaries.

The system supports two Shariah-compliant financing models:
- **Qard Hasan** (interest-free loan)
- **Murabaha** (cost + fixed profit sale)

## Problem Statement
Many small microfinance organizations and community lending groups need a simple way to manage financing records, repayments, and overdue cases. Most generic loan tools are interest-based and do not align with Islamic finance principles.

This project solves that gap by providing a lightweight, browser-based system that applies Shariah-compliant contract logic while keeping data management practical and accessible.

## Solution
Amanah Finance addresses this problem with a multi-page web app that includes:
- Client registration, editing, search, and deletion
- Contract creation for Qard Hasan and Murabaha
- Automatic installment schedule generation
- Payment recording with overpayment prevention
- Overdue detection and late handling options (reminder/reschedule or charity bucket)
- Dashboard KPIs and charts for operational visibility
- Local persistence via `localStorage`

## Technologies Used
- **HTML**: Structures all application pages and content.
- **CSS**: Styles layout, cards, tables, forms, navigation, and responsive behavior.
- **JavaScript (ES Modules)**: Implements business rules, DOM updates, storage logic, validation, and reporting.
- **API Integration**: Uses the Frankfurter exchange-rate API (`USD -> SOS`) for reporting currency conversion with fallback to cached values.

## Key Features
- **Dynamic Content**:
  - DOM rendering for clients, contracts, schedules, payments, overdue rows, and dashboard tables
  - Live KPI updates and filtered views
  - Page-specific logic loaded via JavaScript modules

- **API Integration**:
  - Fetches live exchange rates from `https://api.frankfurter.app/latest?from=USD&to=SOS`
  - Falls back to cached rate from `localStorage` if API request fails
  - Displays source status (live/cache/unavailable) in reports and dashboard

- **Local Storage**:
  - Uses `localStorage` as the project database
  - Main key: `amanahDB`
  - Stores `clients`, `contracts`, `payments`, and `settings` (`currency`, `lastRate`, `charityBucket`)
  - Uses `amanahSession` for simple login session state

## Project Pages
- `html/login.html` - login/auth entry
- `html/index.html` - dashboard (KPIs, charts, due items, recent payments)
- `html/clients.html` - client CRUD + search
- `html/contracts.html` - contract creation + schedule view
- `html/payments.html` - payment posting + payment history
- `html/reports.html` - overdue management, totals, export, currency-aware reporting

## Folder Structure
```text
amanah-finance/
  css/
    style.css
  js/
    api.js
    app.js
    auth.js
    clients.js
    contracts.js
    payments.js
    reports.js
    storage.js
  html/
    index.html
    login.html
    clients.html
    contracts.html
    payments.html
    reports.html
  ReadMe.md
```

## Instructions
### How to Run
1. Open the project folder in VS Code.
2. Start a local server (recommended: Live Server extension).
3. Open `html/login.html` in your browser through the server URL (for example `http://127.0.0.1:5501/amanah-finance/html/login.html`).
4. Login using demo credentials:
   - Username: `admin`
   - Password: `admin123`
5. Navigate through Dashboard, Clients, Contracts, Payments, and Reports.

### Dependencies
- No build tools or package installation required.
- Browser with JavaScript enabled.
- Internet connection for live exchange-rate API calls.
- Chart.js is loaded from CDN in the dashboard page.

## Islamic Finance Compliance Notes
- **Qard Hasan**:
  - Total payable equals principal only
  - No interest or time-based charge
- **Murabaha**:
  - Total payable = cost price + fixed profit amount
  - Profit is fixed upfront and transparent
- **Late Handling**:
  - No late-interest mechanism
  - Supports reminder/reschedule or charity-bucket handling

## Future Improvements
- Role-based access control (Admin/Staff)
- Data import/export (JSON backup/restore)
- PDF contract generation and printable reports
- SMS/WhatsApp reminder integrations
- IndexedDB migration for larger datasets
- Unit tests for schedule and payment engine logic
