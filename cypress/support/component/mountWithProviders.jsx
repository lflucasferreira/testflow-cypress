import React from 'react'
import { mount } from '@cypress/react18'

export function TestProviders({ children }) {
  return (
    <div data-testid="theme-wrapper" style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      {children}
    </div>
  )
}

export function mountWithProviders(component) {
  return mount(<TestProviders>{component}</TestProviders>)
}
