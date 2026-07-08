CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Normalized instead of a JSON array column so we can filter/join on
-- environment type directly (e.g. "show all OT customers").
CREATE TABLE customer_environment_types (
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  environment_type TEXT NOT NULL CHECK (environment_type IN ('IT', 'OT')),
  PRIMARY KEY (customer_id, environment_type)
);
