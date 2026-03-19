-- Database Schema for Client Control System

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'Free',
    subscriptionStatus TEXT DEFAULT 'ACTIVE',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT DEFAULT 'StaffUser',
    status TEXT DEFAULT 'ACTIVE',
    tenantId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    contractedService TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Professionals Table
CREATE TABLE IF NOT EXISTS professionals (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    clientId TEXT NOT NULL,
    professionalId TEXT NOT NULL,
    tenantId TEXT NOT NULL,
    serviceName TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    status TEXT DEFAULT 'Pendente',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (professionalId) REFERENCES professionals(id) ON DELETE CASCADE,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Access Logs Table
CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userEmail TEXT NOT NULL,
    ipAddress TEXT,
    tenantId TEXT,
    loginStatus TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    planId TEXT NOT NULL,
    status TEXT NOT NULL,
    currentPeriodEnd DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    amount REAL NOT NULL,
    paymentMethod TEXT,
    transactionId TEXT,
    status TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);
