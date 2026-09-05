-- ThreadCraft Luxe POS & ERP Database Initialization Script
-- Auto-executed by Docker when initializing MySQL container

CREATE DATABASE IF NOT EXISTS garment_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE garment_erp;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE,
    role VARCHAR(80) NOT NULL,
    role_key VARCHAR(40) NOT NULL DEFAULT 'admin',
    avatar VARCHAR(10) DEFAULT '👤',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(80) NOT NULL UNIQUE,
    barcode VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    fabric VARCHAR(150),
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    mrp DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    sizes JSON,
    colors JSON,
    fit VARCHAR(50),
    tax_rate DECIMAL(5, 2) DEFAULT 12.00,
    hsn VARCHAR(30),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(120),
    city VARCHAR(100),
    gstin VARCHAR(50),
    credit_limit DECIMAL(10, 2) DEFAULT 0.00,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Measurements Table
CREATE TABLE IF NOT EXISTS measurements (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150),
    customer_phone VARCHAR(50),
    suit_type VARCHAR(100) DEFAULT 'Bespoke Suit',
    measurements JSON NOT NULL,
    fit_preference VARCHAR(100),
    posture_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    contact_person VARCHAR(120),
    phone VARCHAR(50),
    email VARCHAR(120),
    city VARCHAR(100),
    rating DECIMAL(3, 1) DEFAULT 4.5,
    balance_due DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    po_no VARCHAR(50) NOT NULL UNIQUE,
    vendor_id VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(150),
    order_date VARCHAR(50),
    expected_delivery VARCHAR(50),
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Pending',
    items_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- 7. Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id VARCHAR(50) PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(50),
    customer_name VARCHAR(150),
    cashier_name VARCHAR(120),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    status VARCHAR(50) DEFAULT 'Completed',
    items_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 8. Sales Order Items Table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(80),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 9. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(120) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(50),
    join_date VARCHAR(50),
    pay_type VARCHAR(50) DEFAULT 'piece_rate',
    base_salary DECIMAL(10, 2) DEFAULT 500.00,
    piece_rate_unit DECIMAL(10, 2) DEFAULT 28.50,
    piece_rate_per_item JSON,
    advance_loan_total DECIMAL(10, 2) DEFAULT 0.00,
    advance_loan_deduction_per_month DECIMAL(10, 2) DEFAULT 0.00,
    advance_loan_remaining DECIMAL(10, 2) DEFAULT 0.00,
    performance_score DECIMAL(3, 2) DEFAULT 4.80,
    pieces_completed_this_month INT DEFAULT 0,
    sales_achieved_this_month DECIMAL(10, 2) DEFAULT 0.00,
    sales_commission_rate DECIMAL(5, 2) DEFAULT 2.50,
    overtime_rate_per_hour DECIMAL(10, 2) DEFAULT 8.00,
    avatar VARCHAR(10) DEFAULT '👤',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    emp_name VARCHAR(150) NOT NULL,
    date VARCHAR(50) NOT NULL,
    in_time VARCHAR(50),
    out_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Present',
    ot_hours DECIMAL(4, 1) DEFAULT 0.0,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

-- 11. Order Bookings Table
CREATE TABLE IF NOT EXISTS order_bookings (
    id VARCHAR(50) PRIMARY KEY,
    booking_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(50),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    garment_type VARCHAR(150) NOT NULL,
    fabric_details VARCHAR(255),
    booking_date VARCHAR(50),
    trial_date VARCHAR(50),
    delivery_date VARCHAR(50),
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    advance_paid DECIMAL(10, 2) DEFAULT 0.00,
    balance_due DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'In Production',
    assigned_master VARCHAR(150),
    special_instructions TEXT,
    measurement_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 12. Master Job Assignments Table
CREATE TABLE IF NOT EXISTS master_job_assignments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50),
    master_id VARCHAR(50),
    master_name VARCHAR(150) NOT NULL,
    garment_type VARCHAR(150) NOT NULL,
    stage VARCHAR(100) DEFAULT 'Cutting',
    piece_rate DECIMAL(10, 2) DEFAULT 0.00,
    completion_incentive DECIMAL(10, 2) DEFAULT 0.00,
    assigned_date VARCHAR(50),
    completed_date VARCHAR(50),
    order_delivered BOOLEAN DEFAULT FALSE,
    order_settled BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    payout_date VARCHAR(50),
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES order_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (master_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 13. Ledger Entries Table
CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    party_type VARCHAR(100),
    party_name VARCHAR(150),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    balance_after DECIMAL(12, 2) DEFAULT 0.00,
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Product Stages Table
CREATE TABLE IF NOT EXISTS product_stages (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NULL,
    batch_no VARCHAR(50) NOT NULL UNIQUE,
    client_name VARCHAR(150),
    garment_type VARCHAR(150) NOT NULL,
    quantity INT DEFAULT 1,
    current_stage VARCHAR(100) NOT NULL,
    assigned_to VARCHAR(150),
    start_date VARCHAR(50),
    target_date VARCHAR(50),
    progress INT DEFAULT 0,
    priority VARCHAR(30) DEFAULT 'Medium',
    fabric_code VARCHAR(100),
    qc_status VARCHAR(50),
    notes TEXT,
    history JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_stages_booking_id (booking_id),
    CONSTRAINT fk_product_stages_booking FOREIGN KEY (booking_id) REFERENCES order_bookings(id) ON DELETE SET NULL
);

ALTER TABLE product_stages
    ADD COLUMN IF NOT EXISTS booking_id VARCHAR(50) NULL,
    ADD INDEX IF NOT EXISTS idx_product_stages_booking_id (booking_id);

-- =================================================================
-- SEED INITIAL DATA
-- =================================================================

-- Seed Users
INSERT INTO users (id, username, password_hash, name, email, role, role_key, avatar)
VALUES
('USR-01', 'admin', 'password123', 'Vikramaditya Singhania', 'director@threadcraft.com', 'Store Owner & Managing Director', 'admin', '👑'),
('USR-02', 'cashier', 'password123', 'David Miller', 'david.cashier@threadcraft.com', 'Head Sales Cashier', 'cashier', '🛍️'),
('USR-03', 'tailor', 'password123', 'Master Harun Rasheed', 'master.harun@threadcraft.com', 'Master Tailor & Production Lead', 'tailor', '✂️'),
('USR-04', 'manager', 'password123', 'Pooja Mehta', 'pooja.manager@threadcraft.com', 'Operations & Accounts Manager', 'manager', '📊')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Customers
INSERT INTO customers (id, name, phone, email, city, gstin, credit_limit, balance)
VALUES
('CUST-01', 'Rajesh Singhania', '9820112345', 'rajesh.singhania@apexcorp.in', 'Mumbai', '27AABCU9603R1ZM', 50000.00, 4200.00),
('CUST-02', 'Aditya Birla', '9811223344', 'aditya.b@outlook.com', 'New Delhi', '', 25000.00, 0.00),
('CUST-03', 'Kavita Krishnamurthy', '9845012398', 'kavita.k@gmail.com', 'Bangalore', '', 15000.00, 1500.00),
('CUST-04', 'Ananya Deshmukh', '9769011223', 'ananya.d@studioart.org', 'Pune', '27BBRPM4421P1Z5', 30000.00, 0.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Products
INSERT INTO products (id, sku, barcode, name, category, brand, fabric, cost_price, price, mrp, stock, min_stock, sizes, colors, fit, tax_rate, hsn, image)
VALUES
('PRD-101', 'TC-SUIT-001', '890123456001', 'Royal Navy Bespoke Three-Piece Suit', 'Suits & Blazers', 'ThreadCraft Heritage', 'Super 150s Merino Wool', 11500.00, 24999.00, 29999.00, 14, 5, '["38R", "40R", "42R", "44L"]', '["Navy Blue", "Midnight Blue"]', 'Slim Fit', 12.00, '6203', '👔'),
('PRD-102', 'TC-SUIT-002', '890123456002', 'Charcoal Grey Double-Breasted Tuxedo', 'Savile Line', 'Savile Line', 'Italian Cashmere Blend', 14200.00, 31500.00, 37999.00, 8, 3, '["38R", "40R", "42R"]', '["Charcoal Grey"]', 'Tailored Fit', 12.00, '6203', '🤵'),
('PRD-103', 'TC-SHIRT-001', '890123456003', 'Egyptian Giza Cotton Formal Shirt', 'Shirts', 'ThreadCraft Luxe', '100% Giza Long-Staple Cotton', 1100.00, 3499.00, 4299.00, 42, 10, '["39", "40", "42", "44"]', '["Crisp White", "Powder Blue", "Ecru"]', 'Contemporary Fit', 12.00, '6205', '👕'),
('PRD-104', 'TC-SHIRT-002', '890123456004', 'Linen Blend French Cuff Spread Collar', 'Shirts', 'ThreadCraft Luxe', '60% Linen, 40% Cotton', 950.00, 2899.00, 3499.00, 28, 8, '["38", "40", "42"]', '["Sky Blue", "Pastel Pink", "Beige"]', 'Slim Fit', 12.00, '6205', '👔'),
('PRD-105', 'TC-ETHNIC-001', '890123456005', 'Raw Silk Zari Embroidered Sherwani', 'Ethnic & Ceremonial', 'Rajwada Couture', 'Pure Banarasi Raw Silk', 18500.00, 42000.00, 49999.00, 6, 2, '["40", "42", "44"]', '["Antique Ivory", "Champagne Gold"]', 'Royal Cut', 12.00, '6203', '👑'),
('PRD-106', 'TC-TROUSER-001', '890123456006', 'Gurkha Pleated Flannel Trousers', 'Trousers', 'ThreadCraft Heritage', 'Super 120s Wool Flannel', 1800.00, 4999.00, 5999.00, 22, 6, '["30", "32", "34", "36"]', '["Olive Green", "Charcoal", "Tobacco Tan"]', 'High-Rise Relaxed', 12.00, '6204', '👖')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Vendors
INSERT INTO vendors (id, name, category, contact_person, phone, email, city, rating, balance_due)
VALUES
('VEN-01', 'Raymond Luxury Mills Ltd', 'Suiting & Shirting', 'Kailash Singhania', '022-61234567', 'corporate@raymond.in', 'Thane, Mumbai', 4.9, 145000.00),
('VEN-02', 'Oritex Threads & Trims', 'Accessories & Trims', 'Narendra Goyal', '011-23984512', 'orders@oritex.com', 'Surat, Gujarat', 4.7, 24500.00),
('VEN-03', 'Zari Heritage Banaras', 'Silks & Brocades', 'Pandit Mohanlal', '0542-2450192', 'heritage@banarassilk.org', 'Varanasi, UP', 4.8, 88000.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Employees
INSERT INTO employees (id, emp_id, name, role, department, phone, join_date, pay_type, base_salary, piece_rate_unit, avatar, status)
VALUES
('EMP-01', 'TC-EMP-01', 'Master Harun Rasheed', 'Master Tailor & Cutting Lead', 'Production', '9820011221', '2021-03-15', 'piece_rate', 600.00, 35.00, '✂️', 'Active'),
('EMP-02', 'TC-EMP-02', 'Suresh Kumar Sharma', 'Senior Coat Maker', 'Tailoring', '9820022332', '2022-06-01', 'piece_rate', 500.00, 28.50, '🧵', 'Active'),
('EMP-03', 'TC-EMP-03', 'David Miller', 'Head Sales Cashier', 'Showroom Front', '9820033443', '2023-01-10', 'commission_fixed', 1200.00, 0.00, '🛍️', 'Active'),
('EMP-04', 'TC-EMP-04', 'Fatima Zahra', 'Finishing & QC Specialist', 'Quality Assurance', '9820044554', '2022-11-20', 'fixed', 750.00, 0.00, '✨', 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Product Stages
INSERT INTO product_stages (id, batch_no, client_name, garment_type, quantity, current_stage, assigned_to, start_date, target_date, progress, priority, fabric_code, qc_status)
VALUES
('STG-01', 'BATCH-801', 'Rajesh Singhania', 'Three-Piece Wool Suit', 1, 'Cutting', 'Master Harun Rasheed', '2026-09-01', '2026-09-08', 35, 'High', 'TC-FAB-992', 'In Progress'),
('STG-02', 'BATCH-802', 'Aditya Birla', 'Cashmere Double-Breasted Blazer', 1, 'Stitching', 'Suresh Kumar Sharma', '2026-08-28', '2026-09-06', 70, 'High', 'TC-FAB-814', 'Pending Trial'),
('STG-03', 'BATCH-803', 'Kavita Krishnamurthy', 'Raw Silk Zari Sherwani', 1, 'Pattern Making', 'Master Harun Rasheed', '2026-09-02', '2026-09-12', 15, 'Medium', 'TC-FAB-108', 'Pending'),
('STG-04', 'BATCH-804', 'Ananya Deshmukh', 'Bandhgala Ceremonial Coat', 1, 'Finishing & QC', 'Fatima Zahra', '2026-08-25', '2026-09-04', 92, 'Medium', 'TC-FAB-310', 'Passed')
ON DUPLICATE KEY UPDATE client_name=VALUES(client_name);

-- Seed Ledger Entries
INSERT INTO ledger_entries (id, date, type, category, party_type, party_name, description, amount, balance_after, reference)
VALUES
('LED-001', '2026-09-01', 'Credit', 'Sales', 'Customer', 'Walk-in Cashier', 'Bespoke Suit Sale #INV-1092', 24999.00, 184500.00, 'INV-1092'),
('LED-002', '2026-09-01', 'Debit', 'Material Purchase', 'Supplier', 'Raymond Luxury Mills', 'Purchase Order #PO-901 Wool Batches', 45000.00, 139500.00, 'PO-901'),
('LED-003', '2026-09-02', 'Credit', 'Tailoring Advance', 'Customer', 'Rajesh Singhania', 'Advance Booking #BK-301 Suit', 15000.00, 154500.00, 'BK-301'),
('LED-004', '2026-09-03', 'Debit', 'Salaries & Advances', 'Staff', 'Master Harun Rasheed', 'Weekly Production Piece Rate Payout', 8400.00, 146100.00, 'PAY-881')
ON DUPLICATE KEY UPDATE description=VALUES(description);
