const ENDPOINT = '/api/auth/login'
const VALID = { email: Cypress.env('DEMO_EMAIL'), password: Cypress.env('DEMO_PASSWORD') }

describe('API — POST /api/auth/login', () => {
  context('Valid credentials', () => {
    let res

    before(() => {
      cy.request({ method: 'POST', url: ENDPOINT, body: VALID })
        .then((r) => { res = r })
    })

    it('returns status 200', () => {
      expect(res.status).to.eq(200)
    })

    it('content-type is application/json', () => {
      expect(res.headers['content-type']).to.include('application/json')
    })

    it('responds within 2000ms', () => {
      expect(res.duration).to.be.lessThan(2000)
    })

    it('body has token as non-empty string', () => {
      expect(res.body.token).to.be.a('string').and.not.be.empty
    })

    it('body has user object with email and name', () => {
      cy.validateSchema(res.body.user, { email: 'string', name: 'string' })
    })

    it('user.email matches the login email', () => {
      expect(res.body.user.email).to.eq(VALID.email)
    })

    it('token can authenticate a subsequent request', () => {
      cy.request({
        url: '/api/users',
        headers: { Authorization: `Bearer ${res.body.token}` },
      }).its('status').should('eq', 200)
    })
  })

  context('Invalid credentials', () => {
    it('returns 401 for wrong password', () => {
      cy.request({
        method: 'POST',
        url: ENDPOINT,
        body: { email: VALID.email, password: 'wrongpassword' },
        failOnStatusCode: false,
      }).its('status').should('eq', 401)
    })

    it('returns 401 for unknown email', () => {
      cy.request({
        method: 'POST',
        url: ENDPOINT,
        body: { email: 'nobody@example.com', password: VALID.password },
        failOnStatusCode: false,
      }).its('status').should('eq', 401)
    })

    it('error response has a message field', () => {
      cy.request({
        method: 'POST',
        url: ENDPOINT,
        body: { email: VALID.email, password: 'wrong' },
        failOnStatusCode: false,
      }).then(({ body }) => {
        expect(body).to.have.property('message')
        expect(body.message).to.be.a('string').and.not.be.empty
      })
    })
  })

  context('Malformed request', () => {
    it('returns 4xx when body is empty', () => {
      cy.request({
        method: 'POST',
        url: ENDPOINT,
        body: {},
        failOnStatusCode: false,
      }).its('status').should('be.within', 400, 422)
    })

    it('returns 4xx when email is missing', () => {
      cy.request({
        method: 'POST',
        url: ENDPOINT,
        body: { password: VALID.password },
        failOnStatusCode: false,
      }).its('status').should('be.within', 400, 422)
    })

    it('returns 4xx when password is missing', () => {
      cy.request({
        method: 'POST',
        url: ENDPOINT,
        body: { email: VALID.email },
        failOnStatusCode: false,
      }).its('status').should('be.within', 400, 422)
    })
  })

  context('Intercept — login flow validates network contract', () => {
    it('UI login triggers POST to /api/auth/login with correct payload', () => {
      cy.intercept('POST', ENDPOINT).as('loginCall')

      cy.visit('/web/login.html')
      cy.getByTestId('login-email').type(VALID.email)
      cy.getByTestId('login-password').type(VALID.password, { log: false })
      cy.getByTestId('login-submit').click()

      cy.wait('@loginCall').then(({ request, response }) => {
        expect(request.body.email).to.eq(VALID.email)
        expect(request.body.password).to.eq(VALID.password)
        expect(response.statusCode).to.eq(200)
        expect(response.body.token).to.be.a('string').and.not.be.empty
      })
    })

    it('API toggle sends request and receives token', () => {
      cy.intercept('POST', ENDPOINT).as('loginCall')

      cy.visit('/web/login.html')
      cy.getByTestId('login-use-api').check()
      cy.getByTestId('login-email').type(VALID.email)
      cy.getByTestId('login-password').type(VALID.password, { log: false })
      cy.getByTestId('login-submit').click()

      cy.wait('@loginCall').its('response.statusCode').should('eq', 200)
    })

    it('stubbed 500 shows error message to the user', () => {
      cy.intercept('POST', ENDPOINT, {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('loginFail')

      cy.visit('/web/login.html')
      cy.getByTestId('login-email').type(VALID.email)
      cy.getByTestId('login-password').type(VALID.password, { log: false })
      cy.getByTestId('login-submit').click()

      cy.wait('@loginFail')
      cy.getByTestId('login-result').should('be.visible')
    })
  })
})
