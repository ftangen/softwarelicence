const db = require('../connection');
const HttpError = require('../../utils/httpError');
const customersRepo = require('./customers');

const PROJECT_NUMBER_RE = /^\d{5}$/;

function listByCustomer(customerId) {
  return db
    .prepare('SELECT id, customer_id, project_number, project_name, notes FROM projects WHERE customer_id = ? ORDER BY project_number')
    .all(customerId);
}

function exists(id) {
  return !!db.prepare('SELECT 1 FROM projects WHERE id = ?').get(id);
}

function create({ customer_id, project_number, project_name, notes }) {
  const customerId = Number(customer_id);
  if (!customerId || !customersRepo.exists(customerId)) {
    throw new HttpError(400, 'customer_id must reference an existing customer');
  }
  if (!PROJECT_NUMBER_RE.test(project_number || '')) {
    throw new HttpError(400, 'project_number must be exactly 5 digits');
  }
  if (!project_name || typeof project_name !== 'string' || !project_name.trim()) {
    throw new HttpError(400, 'project_name is required');
  }

  let projectId;
  try {
    projectId = db
      .prepare('INSERT INTO projects (customer_id, project_number, project_name, notes) VALUES (?, ?, ?, ?)')
      .run(customerId, project_number, project_name.trim(), notes ?? null).lastInsertRowid;
  } catch (err) {
    if (String(err.message).includes('UNIQUE constraint failed')) {
      throw new HttpError(409, `Project number ${project_number} is already in use`);
    }
    throw err;
  }

  return db
    .prepare('SELECT id, customer_id, project_number, project_name, notes FROM projects WHERE id = ?')
    .get(projectId);
}

module.exports = { listByCustomer, exists, create };
