const db = require('../connection');
const HttpError = require('../../utils/httpError');
const { computeStatus } = require('../../utils/status');
const { validateDate } = require('../../utils/validation');

function toResponse(row) {
  return { ...row, status: computeStatus(row.eol_date, row.eos_date) };
}

function getById(id) {
  const row = db.prepare('SELECT * FROM software_library WHERE id = ?').get(id);
  return row ? toResponse(row) : null;
}

function list({ search } = {}) {
  let sql = 'SELECT * FROM software_library';
  const params = [];
  if (search) {
    sql += ' WHERE software_name LIKE ? OR version LIKE ?';
    const like = `%${search}%`;
    params.push(like, like);
  }
  sql += ' ORDER BY software_name, version';

  return db.prepare(sql).all(...params).map(toResponse);
}

function validateFields({ software_name, eol_date, eos_date }) {
  if (!software_name || typeof software_name !== 'string' || !software_name.trim()) {
    throw new HttpError(400, 'software_name is required');
  }
  return {
    softwareName: software_name.trim(),
    eol: validateDate('eol_date', eol_date),
    eos: validateDate('eos_date', eos_date),
  };
}

function create({ software_name, version, eol_date, eos_date, notes }) {
  const { softwareName, eol, eos } = validateFields({ software_name, eol_date, eos_date });

  let itemId;
  try {
    itemId = db
      .prepare('INSERT INTO software_library (software_name, version, eol_date, eos_date, notes) VALUES (?, ?, ?, ?, ?)')
      .run(softwareName, version || null, eol, eos, notes ?? null).lastInsertRowid;
  } catch (err) {
    if (String(err.message).includes('UNIQUE constraint failed')) {
      throw new HttpError(409, `"${softwareName}"${version ? ` (${version})` : ''} is already in the library`);
    }
    throw err;
  }

  return getById(itemId);
}

function update(id, { software_name, version, eol_date, eos_date, notes }) {
  if (!getById(id)) {
    throw new HttpError(404, 'Software library item not found');
  }
  const { softwareName, eol, eos } = validateFields({ software_name, eol_date, eos_date });

  try {
    db.prepare(`
      UPDATE software_library
      SET software_name = ?, version = ?, eol_date = ?, eos_date = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(softwareName, version || null, eol, eos, notes ?? null, id);
  } catch (err) {
    if (String(err.message).includes('UNIQUE constraint failed')) {
      throw new HttpError(409, `"${softwareName}"${version ? ` (${version})` : ''} is already in the library`);
    }
    throw err;
  }

  return getById(id);
}

function remove(id) {
  if (!getById(id)) {
    throw new HttpError(404, 'Software library item not found');
  }
  db.prepare('DELETE FROM software_library WHERE id = ?').run(id);
}

module.exports = { list, getById, create, update, remove };
