const db = require('../connection');
const { computeStatus } = require('../../utils/status');

const STATUS_PRIORITY = { Critical: 3, Approaching: 2, Unknown: 1, OK: 0 };

function listGrouped({ search } = {}) {
  let sql = `
    SELECT
      se.id, se.software_name, se.version, se.eol_date, se.eos_date, se.license_type, se.notes,
      p.project_number, p.project_name,
      c.name as customer_name
    FROM software_entries se
    JOIN projects p ON p.id = se.project_id
    JOIN customers c ON c.id = p.customer_id
  `;
  const params = [];
  if (search) {
    sql += ' WHERE se.software_name LIKE ? OR c.name LIKE ? OR p.project_number LIKE ? OR p.project_name LIKE ? OR se.version LIKE ?';
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  sql += ' ORDER BY se.software_name, c.name';

  const rows = db.prepare(sql).all(...params);

  const groups = new Map();
  for (const row of rows) {
    const status = computeStatus(row.eol_date, row.eos_date);
    if (!groups.has(row.software_name)) {
      groups.set(row.software_name, { software_name: row.software_name, worst_status: status, registrations: [] });
    }
    const group = groups.get(row.software_name);
    group.registrations.push({
      id: row.id,
      software_name: row.software_name,
      customer_name: row.customer_name,
      project_number: row.project_number,
      project_name: row.project_name,
      version: row.version,
      eol_date: row.eol_date,
      eos_date: row.eos_date,
      license_type: row.license_type,
      notes: row.notes,
      status,
    });
    if (STATUS_PRIORITY[status] > STATUS_PRIORITY[group.worst_status]) {
      group.worst_status = status;
    }
  }

  return Array.from(groups.values());
}

module.exports = { listGrouped };
