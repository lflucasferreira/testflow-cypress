describe('API — Users & Health', { tags: '@api @regression' }, () => {
  context('GET /api/users', { tags: '@api' }, () => {
    let res

    before(() => {
      cy.request('/api/users').then((r) => { res = r })
    })

    it('returns status 200', { tags: '@smoke @api' }, () => {
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

  context('GET /health', { tags: '@api @smoke' }, () => {
    it('returns status 200', { tags: '@smoke @api' }, () => {
      cy.request('/health').its('status').should('eq', 200)
    })

    it('responds within 1000ms', () => {
      cy.request('/health').its('duration').should('be.lessThan', 1000)
    })
  })

  context('Error simulation endpoints', { tags: '@api' }, () => {
    it('GET /api/errors/404 returns 404', () => {
      cy.request({ url: '/api/errors/404', failOnStatusCode: false })
        .its('status').should('eq', 404)
    })

    it('GET /api/errors/422 returns 422', () => {
      cy.request({ url: '/api/errors/422', failOnStatusCode: false })
        .its('status').should('eq', 422)
    })

    it('404 response has a non-empty error or message field', () => {
      cy.request({ url: '/api/errors/404', failOnStatusCode: false })
        .then(({ body }) => {
          const errText = body.message ?? body.error?.message
          expect(errText).to.be.a('string').and.not.be.empty
        })
    })

    it('422 response has a non-empty error or message field', () => {
      cy.request({ url: '/api/errors/422', failOnStatusCode: false })
        .then(({ body }) => {
          const errText = body.message ?? body.error?.message
          expect(errText).to.be.a('string').and.not.be.empty
        })
    })
  })

  context('Fixture + intercept on Activity page', { tags: '@api' }, () => {
    beforeEach(() => {
      cy.visitWithSession('/web/activity.html')
    })

    it('mockApiGet serves empty users fixture on fetch', () => {
      cy.mockApiGet('users/empty-list', /\/api\/users/)
      cy.getByTestId('fetch-users-btn').click()
      cy.wait('@mock_users_empty-list')
      cy.getByTestId('api-result').should('contain.text', 'Fetched 0 users')
    })

    it('readFixture task loads countries lookup', () => {
      cy.task('readFixture', 'lookups/countries.json').then((data) => {
        expect(data.countries).to.be.an('array').and.have.length.greaterThan(0)
        expect(data.countries[0]).to.include.keys('code', 'name')
      })
    })
  })
})
