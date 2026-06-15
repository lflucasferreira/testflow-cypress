module.exports = {
  DIALOG: {
    confirmBtn: { hook: 'modal-confirm-btn', testId: 'modal-confirm-btn' },
    cancelBtn: { hook: 'modal-cancel-btn', testId: 'modal-cancel-btn' },
    closeBtn: { hook: 'modal-close-btn', testId: 'modal-close-btn' },
    overlay: { hook: 'modal-overlay', testId: 'modal-overlay' },
    title: { hook: 'modal-title', testId: 'modal-title' },
    errorIcon: { hook: 'dialog-error-icon', testId: 'dialog-error-icon' },
  },
  USER_FORM: {
    firstName: { hook: 'input-first-name', testId: 'settings-name' },
    lastName: { hook: 'input-last-name', testId: 'settings-title' },
    email: { hook: 'email-input', testId: 'settings-email' },
    errorMsg: { hook: 'field-error-message', testId: 'invite-error' },
    helpText: { hook: 'field-help-text', testId: 'wizard-hint' },
  },
  SHARED: {
    yesOption: { hook: 'yes-option', testId: 'wizard-role-qa' },
    noOption: { hook: 'no-option', testId: 'wizard-role-dev' },
    toast: { hook: 'toast-message', testId: 'toast-message' },
  },
  DATA_TABLE: {
    table: { hook: 'users-table', testId: 'users-table' },
    search: { hook: 'table-search', testId: 'table-search' },
    sortName: { hook: 'table-sort-name', testId: 'table-sort-name' },
    rowCount: { hook: 'table-row-count', testId: 'table-row-count' },
  },
}
