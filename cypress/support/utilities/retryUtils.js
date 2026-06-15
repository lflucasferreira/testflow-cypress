const { TIMEOUTS } = require('../@enums/timeouts')

const DEFAULT_RETRY_CONFIG = {
  maxRetries: TIMEOUTS.RETRY_ATTEMPTS,
  baseDelay: TIMEOUTS.RETRY_BASE,
  maxDelay: TIMEOUTS.RETRY_MAX,
  exponentialBackoff: true,
}

function calculateDelay(attempt, config) {
  if (!config.exponentialBackoff) return config.baseDelay
  const delay = config.baseDelay * 2 ** attempt
  return Math.min(delay, config.maxDelay)
}

function retryOperation(operation, validator, config = {}) {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }

  const executeWithRetry = (remainingRetries, attempt = 0) => {
    if (remainingRetries === 0) {
      throw new Error(`Max retries (${retryConfig.maxRetries}) reached`)
    }

    operation().then((result) => {
      try {
        validator(result)
      } catch (error) {
        if (remainingRetries > 1) {
          cy.wait(calculateDelay(attempt, retryConfig))
          executeWithRetry(remainingRetries - 1, attempt + 1)
        } else {
          throw error
        }
      }
    })
  }

  executeWithRetry(retryConfig.maxRetries)
}

function retryUsersValidation(expectedCount, config = {}) {
  retryOperation(
    () => cy.request('/api/users'),
    (response) => {
      expect(response.status).to.eq(200)
      expect(response.body.users).to.have.length.at.least(expectedCount)
    },
    config,
  )
}

function retryGetUsersField(field, expectedValue, config = {}) {
  retryOperation(
    () => cy.request('/api/users'),
    (response) => {
      expect(response.status).to.eq(200)
      const match = response.body.users.find((u) => u[field] === expectedValue)
      expect(match, `user with ${field}=${expectedValue}`).to.exist
    },
    config,
  )
}

module.exports = {
  DEFAULT_RETRY_CONFIG,
  retryOperation,
  retryUsersValidation,
  retryGetUsersField,
}
