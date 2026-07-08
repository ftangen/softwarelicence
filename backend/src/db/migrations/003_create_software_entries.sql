CREATE TABLE software_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  software_name TEXT NOT NULL,
  version TEXT,
  eol_date TEXT,
  eos_date TEXT,
  license_type TEXT NOT NULL CHECK (license_type IN ('Perpetual', 'Subscription', 'Volume', 'Support')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_software_entries_project_id ON software_entries(project_id);
CREATE INDEX idx_software_entries_software_name ON software_entries(software_name);
