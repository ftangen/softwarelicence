import { useState } from 'react'
import StatusBadge from './StatusBadge'

function worstStatusSummary(group) {
  const count = group.registrations.filter((r) => r.status === group.worst_status).length
  return `${count} ${group.worst_status}`
}

function SoftwareGroupRow({ group, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="software-group">
      <button type="button" className="software-group-header" onClick={() => setExpanded((e) => !e)}>
        <div className="software-group-name">
          <span className={`software-group-chevron${expanded ? ' expanded' : ''}`}>▶</span>
          {group.software_name}
        </div>
        <div className="software-group-meta">
          <span>
            {group.registrations.length} registration{group.registrations.length === 1 ? '' : 's'}
          </span>
          <StatusBadge status={group.worst_status} label={worstStatusSummary(group)} />
        </div>
      </button>

      {expanded && (
        <table className="registration-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Project number</th>
              <th>Project name</th>
              <th>Version</th>
              <th>EOL date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {group.registrations.map((reg) => (
              <tr key={reg.id}>
                <td>{reg.customer_name}</td>
                <td>{reg.project_number}</td>
                <td>{reg.project_name}</td>
                <td>{reg.version || '—'}</td>
                <td>{reg.eol_date || '—'}</td>
                <td>
                  <StatusBadge status={reg.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="link-btn" onClick={() => onEdit(reg)}>
                      Edit
                    </button>
                    <button type="button" className="link-btn danger" onClick={() => onDelete(reg)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SoftwareGroupRow
