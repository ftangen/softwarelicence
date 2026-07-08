const HttpError = require('./httpError');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(label, value) {
  if (value === undefined || value === null || value === '') return null;
  if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, `${label} must be a valid date in YYYY-MM-DD format`);
  }
  return value;
}

module.exports = { validateDate };
