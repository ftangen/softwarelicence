const CRITICAL_THRESHOLD_DAYS = 30;
const APPROACHING_THRESHOLD_DAYS = 90;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// eol_date/eos_date are ISO 'YYYY-MM-DD' strings, so lexicographic
// comparison is equivalent to chronological comparison.
function drivingDate(eolDate, eosDate) {
  if (!eolDate && !eosDate) return null;
  if (!eolDate) return eosDate;
  if (!eosDate) return eolDate;
  return eolDate < eosDate ? eolDate : eosDate;
}

// Status is driven by whichever of EOL/EOS comes soonest (worst case),
// per Fredrik: more security-conscious for converged IT/OT environments.
function computeStatus(eolDate, eosDate, referenceDate = new Date()) {
  const driving = drivingDate(eolDate, eosDate);
  if (!driving) return 'Unknown';

  const daysUntil = (new Date(driving).getTime() - referenceDate.getTime()) / MS_PER_DAY;

  if (daysUntil < CRITICAL_THRESHOLD_DAYS) return 'Critical';
  if (daysUntil < APPROACHING_THRESHOLD_DAYS) return 'Approaching';
  return 'OK';
}

module.exports = {
  computeStatus,
  drivingDate,
  CRITICAL_THRESHOLD_DAYS,
  APPROACHING_THRESHOLD_DAYS,
};
