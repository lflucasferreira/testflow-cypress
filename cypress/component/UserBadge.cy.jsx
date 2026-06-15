import React from 'react'
import { UserBadge } from './ConfirmDialog'

const MOBILE = { width: 375, height: 812 }
const DESKTOP = { width: 1280, height: 800 }

const badgeCases = [
  { verified: false, expectVerify: true, label: 'unverified' },
  { verified: true, expectVerify: false, label: 'verified' },
]

describe('UserBadge', () => {
  badgeCases.forEach(({ verified, expectVerify, label }) => {
    it(`${label} user ${expectVerify ? 'shows' : 'hides'} verify action`, () => {
      cy.mountWithProviders(<UserBadge user={{ name: 'Alex', verified }} />)
      if (expectVerify) {
        cy.getByHook('verify-action').should('be.visible')
      } else {
        cy.assertHookMissing('verify-action')
      }
    })
  })

  it('renders at mobile viewport', () => {
    cy.viewport(MOBILE.width, MOBILE.height)
    cy.mountWithProviders(<UserBadge user={{ name: 'Alex', verified: false }} />)
    cy.getByHook('user-badge').should('be.visible')
    cy.viewport(DESKTOP.width, DESKTOP.height)
  })
})
