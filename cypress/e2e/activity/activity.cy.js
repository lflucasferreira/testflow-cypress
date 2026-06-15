import ActivityPage from '../../pages/ActivityPage'

describe('Activity — dynamic UI & API interactions', { tags: '@regression' }, () => {
  beforeEach(() => {
    ActivityPage.visit()
    ActivityPage.pageRoot().should('exist')
  })

  it('fetches users via API button', { tags: '@smoke @api' }, () => {
    cy.section('Setup intercept')
    cy.interceptGetUsers().as('getUsers')

    cy.section('Trigger fetch')
    cy.step('Click fetch users button')
    ActivityPage.fetchUsersBtn().click()

    cy.section('Assert response')
    cy.wait('@getUsers').its('response.statusCode').should('eq', 200)
    ActivityPage.apiResult().should('not.be.empty')
  })

  it('handles slow API with intercept delay', () => {
    cy.interceptSlowApi(1500).as('slowApi')
    ActivityPage.fetchSlowBtn().click()
    cy.wait('@slowApi')
    ActivityPage.apiResult().should('be.visible')
  })

  it('increments and decrements counter', () => {
    cy.section('Counter interactions')
    ActivityPage.counterIncrement().click().click()
    ActivityPage.counterValue().should('contain.text', '2')
    ActivityPage.counterDecrement().click()
    ActivityPage.counterValue().should('contain.text', '1')
    ActivityPage.counterReset().click()
    ActivityPage.counterValue().should('contain.text', '0')
  })

  it('starts download progress simulation', () => {
    ActivityPage.progressStart().click()
    ActivityPage.downloadProgress().should('exist')
  })

  it('loads dynamic content section', () => {
    ActivityPage.loadDynamicBtn().click()
    ActivityPage.dynamicContent().should('not.be.empty')
  })

  it('uses mockApiGet with empty users fixture', () => {
    cy.mockApiGet('users/empty-list', /\/api\/users/)
    ActivityPage.fetchUsersBtn().click()
    cy.wait('@mock_users_empty-list')
    ActivityPage.apiResult().should('contain.text', 'Fetched 0 users')
  })

  it('readFixture task exposes countries lookup for test data', () => {
    cy.task('readFixture', 'lookups/countries.json').then((data) => {
      expect(data.countries.map((c) => c.code)).to.include('CA')
    })
  })

  it('accepts CSV file via drag-and-drop on drop zone', () => {
    ActivityPage.dropZone().selectFile('cypress/fixtures/sample.csv', { action: 'drag-drop' })
    ActivityPage.dropZone().should('contain.text', 'sample.csv')
  })
})
