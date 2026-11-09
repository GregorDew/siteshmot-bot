-- ==========================================================
-- БАЗА ДАНИХ №1: ПОКУПЦІ ТА АДРЕСИ ДОСТАВКИ (DB_CUSTOMERS)
-- ==========================================================

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  google_email TEXT,
  google_id TEXT,
  password_hash TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  carrier TEXT NOT NULL CHECK (carrier IN ('nova_poshta', 'ukrposhta')),
  city TEXT NOT NULL,
  city_ref TEXT,
  branch TEXT NOT NULL,
  branch_ref TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  address_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_price REAL NOT NULL,
  telegram_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS bot_admins (
  chat_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  registered_at TEXT NOT NULL
);
