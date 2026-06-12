describe('API — Users & Health', () => {
  context('GET /api/users', () => {
    let res

    before(() => {
      cy.request('/api/users').then((r) => { res = r })
    })

    it('returns status 200', () => {
      expect(res.status).to.eq(200)
    })

    it('responds within 2000ms', () => {
      expect(res.duration).to.be.lessThan(2000)
    })

    it('body has a users array', () => {
      expect(res.body.users).to.be.an('array').and.have.length.greaterThan(0)
    })

    it('each user has required fields with correct types', () => {
      res.body.users.forEach((user) => {
        cy.validateSchema(user, {
          name: 'string',
          email: 'string',
          role: 'string',
          status: 'string',
        })
      })
    })

    it('all emails are valid format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      res.body.users.forEach((user) => {
        expect(user.email).to.match(emailRegex)
      })
    })
  })

  context('GET /health', () => {
    it('returns status 200', () => {
      cy.request('/health').its('status').should('eq', 200)
    })

    it('responds within 1000ms', () => {
      cy.request('/health').its('duration').should('be.lessThan', 1000)
    })
  })

  context('Error simulation endpoints', () => {
    it('GET /api/errors/404 returns 404', () => {
      cy.request({ url: '/api/errors/404', failOnStatusCode: false })
        .its('status').should('eq', 404)
    })

    it('GET /api/errors/422 returns 422', () => {
      cy.request({ url: '/api/errors/422', failOnStatusCode: false })
        .its('status').should('eq', 422)
    })

    it('404 response has a message field', () => {
      cy.request({ url: '/api/errors/404', failOnStatusCode: false })
        .its('body').should('have.property', 'message')
    })

    it('422 response has a message field', () => {
      cy.request({ url: '/api/errors/422', failOnStatusCode: false })
        .its('body').should('have.property', 'message')
    })
  })

  context('Intercept — users list loaded on Team page', () => {
    beforeEach(() => {
      cy.visitAuthenticated('/web/team.html')
    })

    it('Team page triggers GET /api/users on load', () => {
      cy.intercept('GET', '/api/users').as('loadUsers')
      cy.reload()
      cy.wait('@loadUsers').its('response.statusCode').should('eq', 200)
    })

    it('stubbed empty users list shows zero rows', () => {
      cy.intercept('GET', '/api/users', {
        statusCode: 200,
        body: { users: [] },
      }).as('emptyUsers')

      cy.reload()
      cy.wait('@emptyUsers')
      cy.getByTestId('users-table').find('tbody tr').should('have.length', 0)
    })

    it('stubbed API error shows fallback state', () => {
      cy.intercept('GET', '/api/users', {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('failUsers')

      cy.reload()
      cy.wait('@failUsers')
      cy.getByTestId('users-table').find('tbody tr').should('have.length', 0)
    })
  })
})
