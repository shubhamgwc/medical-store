# 🏥 MediStore Pro v2 — MVC Architecture

A production-ready Medical Store Management System built with **Node.js**, **Express**, **PostgreSQL**, and **EJS** using a clean, scalable **MVC + Service + Repository** architecture.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB password and store info

# 3. Create tables + seed sample data
npm run db:setup

# 4. Start
npm start          # production
npm run dev        # development (auto-reload with nodemon)
```

Open **http://localhost:3000**

---

## 🏗 Project Structure

```
medistore-pro/
│
├── src/
│   ├── app.js                    # Express bootstrap, middleware, startup
│   │
│   ├── config/
│   │   ├── constants.js          # App-wide constants (store info, enums)
│   │   ├── db.js                 # PostgreSQL connection pool
│   │   └── setupDb.js            # DB init script (run once via npm run db:setup)
│   │
│   ├── repositories/             # DATA ACCESS LAYER — all SQL lives here
│   │   ├── baseRepository.js     # Shared CRUD helpers (findAll, findById, etc.)
│   │   ├── medicineRepository.js
│   │   ├── customerRepository.js
│   │   └── invoiceRepository.js
│   │
│   ├── services/                 # BUSINESS LOGIC LAYER — rules, transactions
│   │   ├── dashboardService.js
│   │   ├── medicineService.js
│   │   ├── saleService.js        # Full sale transaction (invoice + stock deduction)
│   │   ├── customerService.js
│   │   └── reportService.js
│   │
│   ├── controllers/              # REQUEST HANDLERS — thin, delegate to services
│   │   ├── dashboardController.js
│   │   ├── medicineController.js
│   │   ├── saleController.js
│   │   ├── customerController.js
│   │   └── reportController.js
│   │
│   ├── routes/                   # ROUTE DEFINITIONS — map HTTP → controller
│   │   ├── index.js              # Registers all routes + 404 handler
│   │   ├── dashboardRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── customerRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── middlewares/
│   │   ├── flashLocals.js        # Injects flash + store into every view
│   │   └── errorHandler.js       # Global error catcher → renders 500 page
│   │
│   └── utils/
│       ├── response.js           # flashSuccess, flashError, handleServerError
│       └── helpers.js            # generateInvoiceNumber, calcTotals, formatDate
│
├── views/                        # EJS templates
│   ├── partials/
│   │   ├── header.ejs            # Sidebar + flash messages (uses flash.success etc.)
│   │   └── footer.ejs
│   ├── dashboard/index.ejs
│   ├── medicines/
│   ├── sales/
│   ├── customers/
│   ├── reports/
│   └── errors/
│       ├── 404.ejs
│       └── 500.ejs
│
└── public/                       # Static assets
    ├── css/style.css
    └── js/main.js
```

---

## 🔁 Request Lifecycle

```
HTTP Request
    │
    ▼
Express Middleware (helmet, morgan, session, flash, flashLocals)
    │
    ▼
Router  (src/routes/*.js)
    │
    ▼
Controller  (src/controllers/*.js)   ← thin: parse request, call service, respond
    │
    ▼
Service  (src/services/*.js)         ← business logic, validation, transactions
    │
    ▼
Repository  (src/repositories/*.js)  ← SQL queries only
    │
    ▼
PostgreSQL
```

---

## 💬 Messaging System

All user-facing messages flow through a consistent system:

### Flash Messages (server → browser redirect)
```js
// In utils/response.js
flashSuccess(req, res, 'Medicine added!', '/medicines');
flashError(req, res, 'Stock insufficient', '/sales/new');
```

### Flash Types Available
| Type      | CSS class        | Use case                    |
|-----------|------------------|-----------------------------|
| `success` | `.alert-success` | Action completed            |
| `error`   | `.alert-error`   | Validation / DB error       |
| `warning` | `.alert-warning` | Advisory (low stock, etc.)  |
| `info`    | `.alert-info`    | Neutral information         |

### In Templates
Flash is injected automatically via `flashLocals` middleware — no need to pass it manually:
```html
<!-- partials/header.ejs handles rendering all flash types -->
<% flash.success.forEach(msg => { %> ... <% }) %>
```

### Service-Level Errors
Services throw structured errors with `statusCode`:
```js
const err = new Error('Insufficient stock. Available: 5');
err.statusCode = 422;
throw err;
// Controller catches → flashError → user sees the message
```

---

## 🗄 Database Schema

| Table               | Purpose                              |
|---------------------|--------------------------------------|
| `medicines`         | Inventory with pricing, stock, expiry|
| `customers`         | Customer records                     |
| `invoices`          | Sale headers with totals             |
| `invoice_items`     | Line items per invoice               |
| `stock_adjustments` | Full audit trail of every stock move |

---

## ⚙ Environment Variables

| Variable         | Description                         | Default         |
|------------------|-------------------------------------|-----------------|
| `DB_HOST`        | PostgreSQL host                     | `localhost`     |
| `DB_PORT`        | PostgreSQL port                     | `5432`          |
| `DB_NAME`        | Database name                       | `medistore`     |
| `DB_USER`        | DB user                             | `postgres`      |
| `DB_PASSWORD`    | DB password                         | —               |
| `PORT`           | HTTP port                           | `3000`          |
| `SESSION_SECRET` | Session encryption key              | —               |
| `STORE_NAME`     | Shown in sidebar & receipts         | `MediStore Pro` |
| `STORE_ADDRESS`  | Shown on receipts                   | —               |
| `STORE_PHONE`    | Shown on receipts                   | —               |
| `STORE_EMAIL`    | Shown on receipts                   | —               |

---

## 🚀 Features

- ✅ Dashboard with live stats, low stock alerts, expiry warnings
- ✅ Medicines CRUD with soft delete, batch/expiry tracking
- ✅ Restock with full audit trail in `stock_adjustments`
- ✅ POS-style New Sale with live cart, discount & tax calculation
- ✅ Atomic sale transactions (invoice + stock deduction or full rollback)
- ✅ Printable receipts with store branding
- ✅ Sales history with date/name filtering
- ✅ Delete invoice with automatic stock restoration
- ✅ Customer management with purchase stats
- ✅ Date-range reports: revenue, top medicines, low stock, expiry
- ✅ Rate limiting, helmet security headers
- ✅ 404 / 500 error pages
