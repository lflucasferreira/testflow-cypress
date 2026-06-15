const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

function validateWithSchema(obj, schema) {
  const validate = ajv.compile(schema)
  const valid = validate(obj)
  if (!valid) {
    const details = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join('; ')
    throw new Error(`JSON Schema validation failed: ${details}`)
  }
  return true
}

function validateShorthand(obj, schema) {
  Object.entries(schema).forEach(([key, type]) => {
    expect(obj, 'response body').to.have.property(key)
    if (type === 'array') {
      expect(obj[key], `"${key}"`).to.be.an('array')
    } else {
      expect(typeof obj[key], `"${key}" should be ${type}`).to.eq(type)
    }
  })
}

module.exports = { ajv, validateWithSchema, validateShorthand }
