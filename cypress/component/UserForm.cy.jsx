import React from 'react'
import { UserForm } from './ConfirmDialog'

const validationCases = [
  {
    props: { showDocumentId: true, errorMessage: 'This field is mandatory' },
    hook: 'field-error-message',
    text: 'mandatory',
  },
  {
    props: { showDocumentId: false, errorMessage: '' },
    hook: 'field-help-text',
    text: 'Help text',
  },
]

describe('UserForm', () => {
  validationCases.forEach(({ props, hook, text }) => {
    it(`renders ${hook} with expected copy`, () => {
      cy.mountWithProviders(<UserForm {...props} />)
      cy.getByHook(hook).should('contain.text', text)
    })
  })

  it('shows blur validation error when first name is empty', () => {
    cy.mountWithProviders(<UserForm onBlurValidate />)
    cy.getByHook('input-first-name').focus().blur()
    cy.getByHook('field-blur-error').should('contain.text', 'required on blur')
  })

  it('renders inside theme provider wrapper', () => {
    cy.mountWithProviders(<UserForm />)
    cy.getByTestId('theme-wrapper').should('exist')
  })
})
