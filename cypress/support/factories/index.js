const { faker } = require('@faker-js/faker')
const { createNamePatch } = require('../utilities/jsonPatchUtils')

class TeamMemberFactory {
  static createInvite(overrides = {}) {
    const unique = Date.now()
    return {
      name: overrides.name || `${faker.person.firstName()} ${faker.person.jobTitle()}`,
      email: overrides.email || `user.${unique}@testflow.io`,
      role: overrides.role || 'user',
    }
  }

  static createDuplicate() {
    return {
      name: 'Alice QA',
      email: 'alice@testflow.io',
      role: 'admin',
    }
  }
}

class WizardDataFactory {
  static createPersonalStep(overrides = {}) {
    return {
      name: overrides.name || faker.person.fullName(),
      email: overrides.email || faker.internet.email(),
      dob: overrides.dob || '1990-05-15',
      country: overrides.country || 'ca',
    }
  }

  static createPreferencesStep() {
    return {
      framework: 'cypress',
      role: 'qa',
      experience: '3',
    }
  }
}

class UserPatchFactory {
  static createNamePatch(firstName, middleName, lastName) {
    return createNamePatch(firstName, middleName, lastName)
  }

  static createSimpleNamePatch(name) {
    return [{ op: 'replace', path: '/name', value: name }]
  }
}

module.exports = {
  TeamMemberFactory,
  WizardDataFactory,
  UserPatchFactory,
}
