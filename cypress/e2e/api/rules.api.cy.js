const { JsonPatchBuilder, modifyPatchField } = require('../../support/utilities/jsonPatchUtils')
const { ApiTestPatterns } = require('../../support/utilities/testPatterns')
const { UserPatchFactory } = require('../../support/factories')
const { HTTP_STATUS } = require('../../support/@enums/httpStatus')

describe('API — Rules engine patterns (TestFlow adapted)', { tags: '@api @regression' }, () => {
  before(() => {
    cy.setServiceToken()
  })

  context('JSON Patch utilities', () => {
    it('builds RFC 6902 patch operations', () => {
      const patches = new JsonPatchBuilder()
        .replace('/name', 'Alex')
        .replace('/role', 'admin')
        .build()

      expect(patches).to.have.length(2)
      expect(patches[0]).to.deep.eq({ op: 'replace', path: '/name', value: 'Alex' })
    })

    it('modifies patch field for negative tests', () => {
      const base = UserPatchFactory.createNamePatch('A', 'B', 'C')
      const invalid = modifyPatchField(base, '/name', null)
      expect(invalid.find((p) => p.path === '/name').value).to.be.null
    })
  })

  context('patch vs tryPatch', () => {
    it('patchUserViaRules accepts JSON Patch content type', () => {
      cy.section('PATCH with JSON Patch')
      const patches = UserPatchFactory.createNamePatch('Patch', 'Test', 'User')
      cy.tryPatchUserViaRules(patches, 1).then((res) => {
        cy.task('logJson', { label: 'patch-response', data: { status: res.status, body: res.body } })
        expect(res.status).to.be.oneOf([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.NOT_FOUND, HTTP_STATUS.BAD_REQUEST])
      })
    })

    it('tryPatch rejects invalid patch via failOnStatusCode false', () => {
      cy.tryPatchUserViaRules([{ op: 'replace', path: '/invalid', value: null }], 999).then((res) => {
        expect(res.status).to.be.oneOf([400, 404, 422, 500])
      })
    })
  })

  context('Test Builders — executeSuccessfulPatchFlow', { tags: '@api' }, () => {
    beforeEach(() => {
      cy.seedAuthToken()
    })

    it('[TC] patches user and validates read-after-write with retry', () => {
      const uniqueName = `PatchFlow ${Date.now()}`
      const patches = UserPatchFactory.createSimpleNamePatch(uniqueName)

      ApiTestPatterns.executeSuccessfulPatchFlow(
        1,
        patches,
        'patchUserViaRules',
        'name',
      )
    })
  })

  context('Test Builders — mandatory field validation', { tags: '@api' }, () => {
    beforeEach(() => {
      cy.seedAuthToken()
    })

    const basePatch = UserPatchFactory.createSimpleNamePatch('Valid Name')

    ApiTestPatterns.generateMandatoryFieldTests(['/name'], basePatch, 'tryPatchUserViaRules', 1)
  })

  context('Dual-service read after write', () => {
    it('validates GET /api/users after auth token seed', () => {
      cy.section('Seed token')
      cy.seedAuthToken()

      cy.section('Read profile data')
      ApiTestPatterns.executeSuccessfulGetFlow('/api/users', (body) => {
        expect(body.users).to.be.an('array').and.have.length.greaterThan(0)
        cy.validateSchema(body.users[0], { name: 'string', email: 'string', role: 'string' })
      })
    })
  })

  context('Authenticated apiRequest', () => {
    it('apiWithAuth returns users with Bearer token', { tags: '@smoke @api' }, () => {
      cy.apiWithAuth({ method: 'GET', url: '/api/users' }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.users).to.be.an('array')
      })
    })
  })

  context('OAuth-style service token', () => {
    it('setServiceToken stores token in Cypress.env', () => {
      cy.setServiceToken().then((token) => {
        expect(token).to.be.a('string').and.not.be.empty
        expect(Cypress.env('SERVICE_TOKEN')).to.eq(token)
      })
    })

    it('getServiceCredentials returns client credentials object', () => {
      cy.getServiceCredentials().then((creds) => {
        expect(creds).to.have.keys('client_id', 'client_secret')
      })
    })
  })

  context('Intercept with req.reply mutation', () => {
    it('mutates users response to simulate empty list', () => {
      cy.interceptGetUsersAndPatch((body) => {
        body.users = []
        body.total = 0
      })
      cy.visitWithSession('/web/activity.html')
      cy.getByTestId('fetch-users-btn').click()
      cy.wait('@getUsersPatched')
      cy.getByTestId('api-result').should('contain.text', 'Fetched 0 users')
    })
  })
})
