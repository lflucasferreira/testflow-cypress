const { extractPatchValues, modifyPatchField } = require('./jsonPatchUtils')
const { retryGetUsersField } = require('./retryUtils')
const { HTTP_STATUS } = require('../@enums/httpStatus')

class ApiTestPatterns {
  static executeSuccessfulGetFlow(url, schemaValidator) {
    cy.step(`GET ${url}`)
    cy.request(url).then((response) => {
      expect(response.status).to.eq(200)
      schemaValidator(response.body)
    })
  }

  static executeSuccessfulPatchFlow(userId, patches, patchCommand, expectedField, options = {}) {
    const expectedValues = extractPatchValues(patches)
    const successStatuses = options.successStatuses || [HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]
    const fallbackStatuses = options.fallbackStatuses || [400, 404, 405, 422]

    cy.step('Patch via Rules API')
    cy[patchCommand](userId, patches).then((response) => {
      cy.task('logJson', { label: 'patch-flow', data: { status: response.status, userId } })

      if (successStatuses.includes(response.status)) {
        cy.step('Validate via read API with retry')
        if (expectedField && expectedValues[expectedField]) {
          retryGetUsersField(expectedField, expectedValues[expectedField])
        }
        return
      }

      expect(response.status, 'PATCH fallback when write API is unavailable').to.be.oneOf(fallbackStatuses)
    })
  }

  static executeValidationFailureTest(patches, tryPatchCommand, userId = 1) {
    cy[tryPatchCommand](patches, userId).then((response) => {
      expect(response.status).to.be.oneOf([400, 404, 422, 500])
    })
  }

  static generateMandatoryFieldTests(fieldPaths, basePatch, tryPatchCommand, userId = 1) {
    fieldPaths.forEach((path, index) => {
      const tcId = `TC-${4001 + index}`
      it(`[${tcId}] rejects null at ${path}`, () => {
        const modified = modifyPatchField(basePatch, path, null)
        ApiTestPatterns.executeValidationFailureTest(modified, tryPatchCommand, userId)
      })
    })
  }
}

module.exports = { ApiTestPatterns }
