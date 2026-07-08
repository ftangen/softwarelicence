-- Catalog of reusable software definitions (e.g. "Windows Server 2012 R2")
-- with their known EOL/EOS dates, so adding an entry to a customer/project
-- doesn't require retyping the same version + dates every time. Entries
-- copy these values in rather than referencing this table, so editing or
-- removing a library item never affects software already registered.
CREATE TABLE software_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  software_name TEXT NOT NULL,
  version TEXT,
  eol_date TEXT,
  eos_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (software_name, version)
);

CREATE INDEX idx_software_library_name ON software_library(software_name);
