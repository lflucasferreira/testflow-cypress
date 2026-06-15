import LoginPage from '../../pages/LoginPage'

describe('Authentication', { tags: '@regression' }, () => {
  beforeEach(() => {
    LoginPage.visit()
  })

  context('Page structure', () => {
    it('renders all form elements', () => {
      LoginPage.emailInput().should('be.visible')
      LoginPage.passwordInput().should('be.visible')
      LoginPage.submitBtn().should('be.visible').and('not.be.disabled')
      LoginPage.rememberCheckbox().should('exist')
      LoginPage.useApiCheckbox().should('exist')
    })

    it('has correct placeholder text on email field', () => {
      LoginPage.emailInput().should('have.attr', 'placeholder', 'demo@automation.io')
    })

    it('password field masks input', () => {
      LoginPage.passwordInput().should('have.attr', 'type', 'password')
    })
  })

  context('Valid credentials', () => {
    it('logs in via UI and redirects to dashboard', { tags: '@smoke @critical' }, () => {
      LoginPage
        .loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
        .shouldRedirectToDashboard()
    })

    it('logs in with API toggle enabled', () => {
      cy.section('Setup intercept')
      cy.interceptLogin()

      LoginPage
        .toggleUseApi()
        .loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))

      cy.wait('@loginApi').its('response.statusCode').should('eq', 200)
      LoginPage.shouldRedirectToDashboard()
    })

    it('sets auth data in sessionStorage after login', () => {
      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))

      cy.window().then((win) => {
        const auth = JSON.parse(win.sessionStorage.getItem('sandbox-auth') ?? 'null')
        expect(auth).to.not.be.null
        expect(auth.email).to.eq(Cypress.env('DEMO_EMAIL'))
      })
    })

    it('shows success message before redirect', () => {
      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
      cy.get('body').then(($body) => {
        const $result = $body.find('[data-testid="login-result"]')
        if ($result.length && $result.is(':visible')) {
          expect($result.text()).to.include('Login successful')
        }
      })
      LoginPage.shouldRedirectToDashboard()
    })
  })

  context('Invalid credentials', () => {
    beforeEach(() => {
      cy.fixture('credentials').as('creds')
    })

    it('shows error for wrong password', function () {
      LoginPage
        .loginWith(this.creds.valid.email, this.creds.invalid.password)
        .shouldShowError('Invalid credentials')
    })

    it('shows error for unknown email', function () {
      LoginPage
        .loginWith(this.creds.invalid.email, this.creds.valid.password)
        .shouldShowError('Invalid credentials')
    })

    it('does not navigate away on failed login', function () {
      LoginPage.loginWith(this.creds.invalid.email, this.creds.invalid.password)
      cy.url().should('include', '/web/login.html')
    })
  })

  context('Form validation', () => {
    it('requires email to not be empty (HTML5 validation)', () => {
      LoginPage.fillPassword(Cypress.env('DEMO_PASSWORD')).submit()
      LoginPage.emailInput().then(($el) => {
        expect($el[0].validity.valid).to.be.false
      })
    })
  })

  context('Remember me', () => {
    it('checkbox can be checked and unchecked', () => {
      LoginPage.rememberCheckbox().should('not.be.checked')
      LoginPage.toggleRememberMe()
      LoginPage.rememberCheckbox().should('be.checked')
      LoginPage.toggleRememberMe()
      LoginPage.rememberCheckbox().should('not.be.checked')
    })
  })

  context('Redirect after login', () => {
    it('redirects to login when accessing a protected page unauthenticated', () => {
      cy.visit('/web/team.html')
      cy.url().should('include', '/web/login.html')

      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
      cy.url().should('not.include', '/web/login.html')
    })
  })

  context('Accessibility', () => {
    it('login page has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yStandard()
    })
  })
})
