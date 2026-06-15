import React from 'react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('shows optional field when showOptionalField is true', () => {
    cy.mountWithProviders(<ConfirmDialog open showOptionalField onConfirm={() => {}} onCancel={() => {}} />)
    cy.getByHook('input-document-id').should('be.visible')
  })

  it('hides optional field by default', () => {
    cy.mountWithProviders(<ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} />)
    cy.assertHookMissing('input-document-id')
  })

  it('calls onConfirm when confirm clicked', () => {
    const onConfirm = cy.stub().as('onConfirm')
    cy.mountWithProviders(<ConfirmDialog open onConfirm={onConfirm} onCancel={() => {}} />)
    cy.clickHook('dialog-confirm')
    cy.get('@onConfirm').should('have.been.called')
  })
})
