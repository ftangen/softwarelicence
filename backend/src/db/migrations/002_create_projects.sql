-- project_number is assumed to be a company-wide identifier (e.g. Melkoya
-- "50697"), so it's unique globally, not just per customer. Flag to Fredrik
-- if project numbers can actually repeat across different customers.
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_number TEXT NOT NULL UNIQUE CHECK (project_number GLOB '[0-9][0-9][0-9][0-9][0-9]'),
  project_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_customer_id ON projects(customer_id);
