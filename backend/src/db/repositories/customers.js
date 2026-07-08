const db = require('../connection');
const HttpError = require('../../utils/httpError');
const { computeStatus } = require('../../utils/status');

const VALID_ENV_TYPES = ['IT', 'OT'];

function listWithStats() {
  const customers = db.prepare('SELECT id, name, notes FROM customers ORDER BY name').all();

  const envByCustomer = new Map();
  for (const row of db.prepare('SELECT customer_id, environment_type FROM customer_environment_types').all()) {
    if (!envByCustomer.has(row.customer_id)) envByCustomer.set(row.customer_id, []);
    envByCustomer.get(row.customer_id).push(row.environment_type);
  }

  const projectCountByCustomer = new Map(
    db.prepare('SELECT customer_id, COUNT(*) as count FROM projects GROUP BY customer_id').all()
      .map((row) => [row.customer_id, row.count])
  );

  const statsByCustomer = new Map();
  const entryRows = db.prepare(`
    SELECT p.customer_id, se.eol_date, se.eos_date
    FROM software_entries se
    JOIN projects p ON p.id = se.project_id
  `).all();
  for (const row of entryRows) {
    const stats = statsByCustomer.get(row.customer_id) || { asset_count: 0, critical_count: 0, approaching_count: 0 };
    stats.asset_count += 1;
    const status = computeStatus(row.eol_date, row.eos_date);
    if (status === 'Critical') stats.critical_count += 1;
    if (status === 'Approaching') stats.approaching_count += 1;
    statsByCustomer.set(row.customer_id, stats);
  }

  return customers.map((customer) => {
    const stats = statsByCustomer.get(customer.id) || { asset_count: 0, critical_count: 0, approaching_count: 0 };
    return {
      id: customer.id,
      name: customer.name,
      notes: customer.notes,
      environment_types: envByCustomer.get(customer.id) || [],
      project_count: projectCountByCustomer.get(customer.id) || 0,
      asset_count: stats.asset_count,
      critical_count: stats.critical_count,
      approaching_count: stats.approaching_count,
    };
  });
}

function getById(id) {
  const customer = db.prepare('SELECT id, name, notes FROM customers WHERE id = ?').get(id);
  if (!customer) return null;
  const envRows = db.prepare('SELECT environment_type FROM customer_environment_types WHERE customer_id = ?').all(id);
  return { ...customer, environment_types: envRows.map((row) => row.environment_type) };
}

function exists(id) {
  return !!db.prepare('SELECT 1 FROM customers WHERE id = ?').get(id);
}

function create({ name, environment_types, notes }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new HttpError(400, 'name is required');
  }
  if (!Array.isArray(environment_types) || environment_types.length === 0) {
    throw new HttpError(400, 'environment_types must be a non-empty array containing "IT" and/or "OT"');
  }
  for (const type of environment_types) {
    if (!VALID_ENV_TYPES.includes(type)) {
      throw new HttpError(400, `Invalid environment_type: ${type}`);
    }
  }

  let customerId;
  db.exec('BEGIN');
  try {
    customerId = db
      .prepare('INSERT INTO customers (name, notes) VALUES (?, ?)')
      .run(name.trim(), notes ?? null).lastInsertRowid;

    const insertEnv = db.prepare(
      'INSERT INTO customer_environment_types (customer_id, environment_type) VALUES (?, ?)'
    );
    for (const type of new Set(environment_types)) {
      insertEnv.run(customerId, type);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return getById(Number(customerId));
}

module.exports = { listWithStats, getById, exists, create };
