const db = require('../connection');
const HttpError = require('../../utils/httpError');
const projectsRepo = require('./projects');
const { computeStatus } = require('../../utils/status');

const LICENSE_TYPES = ['Perpetual', 'Subscription', 'Volume', 'Support'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(label, value) {
  if (value === undefined || value === null || value === '') return null;
  if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, `${label} must be a valid date in YYYY-MM-DD format`);
  }
  return value;
}

function validateFields({ software_name, license_type, eol_date, eos_date }) {
  if (!software_name || typeof software_name !== 'string' || !software_name.trim()) {
    throw new HttpError(400, 'software_name is required');
  }
  if (!LICENSE_TYPES.includes(license_type)) {
    throw new HttpError(400, `license_type must be one of: ${LICENSE_TYPES.join(', ')}`);
  }
  return {
    softwareName: software_name.trim(),
    eol: validateDate('eol_date', eol_date),
    eos: validateDate('eos_date', eos_date),
  };
}

function getById(id) {
  const row = db.prepare('SELECT * FROM software_entries WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, status: computeStatus(row.eol_date, row.eos_date) };
}

function create({ project_id, software_name, version, eol_date, eos_date, license_type, notes }) {
  const projectId = Number(project_id);
  if (!projectId || !projectsRepo.exists(projectId)) {
    throw new HttpError(400, 'project_id must reference an existing project');
  }
  const { softwareName, eol, eos } = validateFields({ software_name, license_type, eol_date, eos_date });

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO software_entries (project_id, software_name, version, eol_date, eos_date, license_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(projectId, softwareName, version ?? null, eol, eos, license_type, notes ?? null);

  return getById(lastInsertRowid);
}

function update(id, { software_name, version, eol_date, eos_date, license_type, notes }) {
  if (!getById(id)) {
    throw new HttpError(404, 'Software entry not found');
  }
  const { softwareName, eol, eos } = validateFields({ software_name, license_type, eol_date, eos_date });

  db.prepare(`
    UPDATE software_entries
    SET software_name = ?, version = ?, eol_date = ?, eos_date = ?, license_type = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(softwareName, version ?? null, eol, eos, license_type, notes ?? null, id);

  return getById(id);
}

function remove(id) {
  if (!getById(id)) {
    throw new HttpError(404, 'Software entry not found');
  }
  db.prepare('DELETE FROM software_entries WHERE id = ?').run(id);
}

module.exports = { create, update, remove, getById, LICENSE_TYPES };
