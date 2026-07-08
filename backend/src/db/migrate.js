const fs = require('node:fs');
const path = require('node:path');
const db = require('./connection');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function ensureMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function getAppliedMigrations() {
  const rows = db.prepare('SELECT filename FROM schema_migrations').all();
  return new Set(rows.map((row) => row.filename));
}

function runMigrations() {
  ensureMigrationsTable();
  const applied = getAppliedMigrations();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`Applying migration: ${file}`);

    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (filename) VALUES (?)').run(file);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err.message}`);
    }
  }
}

module.exports = { runMigrations };
