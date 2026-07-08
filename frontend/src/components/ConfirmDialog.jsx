import Modal from './Modal'

function ConfirmDialog({ title, message, confirmLabel = 'Delete', danger = true, busy = false, error, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <div className="confirm-dialog">
        <p>{message}</p>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
