const db = require('../connection');
const { computeStatus } = require('../../utils/status');

function listEntries({ search, customer_id, status } = {}) {
  let sql = `
    SELECT
      se.id, se.software_name, se.version, se.eol_date, se.eos_date, se.license_type, se.notes,
      p.id as project_id, p.project_number, p.project_name,
      c.id as customer_id, c.name as customer_name
    FROM software_entries se
    JOIN projects p ON p.id = se.project_id
    JOIN customers c ON c.id = p.customer_id
  `;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(se.software_name LIKE ? OR c.name LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like);
  }
  const customerId = customer_id ? Number(customer_id) : null;
  if (customerId) {
    conditions.push('c.id = ?');
    params.push(customerId);
  }
  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY c.name, se.software_name';

  const rows = db.prepare(sql).all(...params);
  const withStatus = rows.map((row) => ({ ...row, status: computeStatus(row.eol_date, row.eos_date) }));

  return status ? withStatus.filter((row) => row.status === status) : withStatus;
}

function getStats() {
  const rows = db.prepare('SELECT eol_date, eos_date FROM software_entries').all();
  const stats = { total: rows.length, critical: 0, approaching: 0, ok: 0, unknown: 0 };
  for (const row of rows) {
    const status = computeStatus(row.eol_date, row.eos_date);
    if (status === 'Critical') stats.critical += 1;
    else if (status === 'Approaching') stats.approaching += 1;
    else if (status === 'OK') stats.ok += 1;
    else stats.unknown += 1;
  }
  return stats;
}

module.exports = { listEntries, getStats };
