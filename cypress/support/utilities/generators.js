const { faker } = require('@faker-js/faker')

function generateUuid() {
  return faker.string.uuid()
}

function generateEmail(domain = 'testflow.io') {
  return faker.internet.email({ provider: domain.split('.')[0] })
}

function generateDateOfBirth({ minAge = 18, maxAge = 65 } = {}) {
  return faker.date.birthdate({ min: minAge, max: maxAge, mode: 'age' })
    .toISOString()
    .split('T')[0]
}

function generateCorrelationId() {
  return generateUuid()
}

module.exports = {
  generateUuid,
  generateEmail,
  generateDateOfBirth,
  generateCorrelationId,
}
