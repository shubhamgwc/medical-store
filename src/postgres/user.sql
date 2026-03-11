CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Medicines ───────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS medicines (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    generic_name     VARCHAR(255),
    manufacturer     VARCHAR(255),
    category         VARCHAR(100),
    unit             VARCHAR(50)          DEFAULT 'strip',
    purchase_price   NUMERIC(10,2)        NOT NULL DEFAULT 0,
    selling_price    NUMERIC(10,2)        NOT NULL DEFAULT 0,
    stock_quantity   INTEGER              NOT NULL DEFAULT 0,
    min_stock_alert  INTEGER              NOT NULL DEFAULT 10,
    expiry_date      DATE,
    batch_number     VARCHAR(100),
    description      TEXT,
    is_active        BOOLEAN              NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW()
  );

-- ─── Customers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  email      VARCHAR(255),
  address    TEXT,
  is_active  BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Invoices ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id               SERIAL PRIMARY KEY,
  invoice_number   VARCHAR(50)    UNIQUE NOT NULL,
  customer_id      INTEGER        REFERENCES customers(id) ON DELETE SET NULL,
  customer_name    VARCHAR(255)   NOT NULL DEFAULT 'Walk-in Customer',
  customer_phone   VARCHAR(20),
  subtotal         NUMERIC(10,2)  NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2)   NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(10,2)  NOT NULL DEFAULT 0,
  tax_percent      NUMERIC(5,2)   NOT NULL DEFAULT 0,
  tax_amount       NUMERIC(10,2)  NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10,2)  NOT NULL DEFAULT 0,
  payment_method   VARCHAR(50)    NOT NULL DEFAULT 'cash',
  payment_status   VARCHAR(50)    NOT NULL DEFAULT 'paid',
  notes            TEXT,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─── Invoice Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id             SERIAL PRIMARY KEY,
  invoice_id     INTEGER       NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  medicine_id    INTEGER       REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name  VARCHAR(255)  NOT NULL,
  quantity       INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2) NOT NULL,
  subtotal       NUMERIC(10,2) NOT NULL
);

-- ─── Stock Adjustments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id               SERIAL PRIMARY KEY,
  medicine_id      INTEGER      NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  adjustment_type  VARCHAR(50)  NOT NULL,   -- purchase | sale | return | manual
  quantity_change  INTEGER      NOT NULL,
  previous_stock   INTEGER,
  new_stock        INTEGER,
  reason           TEXT,
  reference_id     INTEGER,                 -- invoice_id if type = sale
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_medicines_name     ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_invoices_created   ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_customer  ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_inv_items_invoice  ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_medicine ON stock_adjustments(medicine_id);

-- ─── Seed Data ───────────────────────────────────────────────
INSERT INTO customers (name, phone) VALUES ('Walk-in Customer', '0000000000')
  ON CONFLICT DO NOTHING;

INSERT INTO medicines (name, generic_name, manufacturer, category, unit, purchase_price, selling_price, stock_quantity, min_stock_alert, expiry_date, batch_number) VALUES
  ('Paracetamol 500mg',  'Paracetamol',   'Generic Pharma', 'Pain Relief',    'strip',  8.00,  15.00, 200, 20, '2026-12-31', 'B001'),
  ('Amoxicillin 500mg',  'Amoxicillin',   'MedCorp',        'Antibiotics',    'strip', 45.00,  80.00, 100, 15, '2026-06-30', 'B002'),
  ('Cetirizine 10mg',    'Cetirizine',    'AllergyFree',    'Antihistamine',  'strip', 12.00,  25.00, 150, 20, '2027-03-31', 'B003'),
  ('Omeprazole 20mg',    'Omeprazole',    'GastroMed',      'Gastro',         'strip', 18.00,  35.00,  80, 10, '2026-09-30', 'B004'),
  ('Metformin 500mg',    'Metformin',     'DiabCare',       'Diabetes',       'strip', 22.00,  40.00, 120, 15, '2027-01-31', 'B005'),
  ('Vitamin C 500mg',    'Ascorbic Acid', 'VitaPlus',       'Vitamins',       'bottle',35.00,  60.00,  60, 10, '2027-06-30', 'B006'),
  ('Ibuprofen 400mg',    'Ibuprofen',     'PainAway',       'Pain Relief',    'strip', 10.00,  20.00, 180, 20, '2026-11-30', 'B007'),
  ('Aspirin 75mg',       'Aspirin',       'HeartCare',      'Cardiac',        'strip', 15.00,  28.00,  90, 15, '2026-08-31', 'B008'),
  ('Azithromycin 500mg', 'Azithromycin',  'AntiBio',        'Antibiotics',    'strip', 55.00, 100.00,  40, 10, '2026-05-31', 'B009'),
  ('Pantoprazole 40mg',  'Pantoprazole',  'GutHealth',      'Gastro',         'strip', 20.00,  38.00,   8, 10, '2026-10-31', 'B010')
ON CONFLICT DO NOTHING;