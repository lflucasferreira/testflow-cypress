import React from 'react'
import { LookupPreview } from './LookupPreview'

describe('LookupPreview — component intercept', () => {
  it('loads countries count from mocked lookup API', () => {
    cy.mockCountriesLookup()
    cy.mountWithProviders(<LookupPreview />)
    cy.wait('@countriesLookup')
    cy.getByHook('lookup-count').should('contain.text', '3 countries')
  })
})
