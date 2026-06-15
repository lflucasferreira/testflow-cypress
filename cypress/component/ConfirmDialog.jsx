import React from 'react'

export function ConfirmDialog({ open, onConfirm, onCancel, showOptionalField, title = 'Confirm action' }) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-cy-hook="modal-overlay"
      data-testid="modal-overlay"
    >
      <h2 id="modal-title" data-cy-hook="dialog-title">{title}</h2>
      {showOptionalField && (
        <input data-cy-hook="input-document-id" data-testid="input-document-id" placeholder="Document ID" />
      )}
      <button type="button" data-cy-hook="dialog-confirm" data-testid="modal-confirm-btn" onClick={onConfirm}>
        Confirm
      </button>
      <button type="button" data-cy-hook="dialog-cancel" data-testid="modal-cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <span data-cy-hook="dialog-error-icon" data-testid="dialog-error-icon" style={{ display: 'none' }} />
    </div>
  )
}

export function UserForm({ showDocumentId = false, errorMessage = '', onBlurValidate = false }) {
  const [blurError, setBlurError] = React.useState('')

  const handleBlur = (event) => {
    if (!onBlurValidate) return
    if (!event.target.value.trim()) {
      setBlurError('This field is required on blur')
    } else {
      setBlurError('')
    }
  }

  return (
    <form>
      <input
        data-cy-hook="input-first-name"
        data-testid="input-first-name"
        placeholder="First name"
        onBlur={onBlurValidate ? handleBlur : undefined}
      />
      <input data-cy-hook="input-last-name" data-testid="input-last-name" placeholder="Last name" />
      {showDocumentId && (
        <input data-cy-hook="input-document-id" data-testid="input-document-id" placeholder="Document ID" />
      )}
      {errorMessage && (
        <span data-cy-hook="field-error-message" data-testid="field-error-message">{errorMessage}</span>
      )}
      {blurError && (
        <span data-cy-hook="field-blur-error" data-testid="field-blur-error">{blurError}</span>
      )}
      <span data-cy-hook="field-help-text" data-testid="field-help-text">Help text</span>
    </form>
  )
}

export function UserBadge({ user }) {
  return (
    <div data-cy-hook="user-badge" data-testid="user-badge">
      <span>{user.name}</span>
      {!user.verified && (
        <button type="button" data-cy-hook="verify-action" data-testid="verify-action">
          Verify
        </button>
      )}
    </div>
  )
}
