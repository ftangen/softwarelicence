const STATUS_CLASS = {
  Critical: 'status-critical',
  Approaching: 'status-approaching',
  OK: 'status-ok',
  Unknown: 'status-unknown',
}

function StatusBadge({ status, label }) {
  return <span className={`status-badge ${STATUS_CLASS[status] || 'status-unknown'}`}>{label ?? status}</span>
}

export default StatusBadge
