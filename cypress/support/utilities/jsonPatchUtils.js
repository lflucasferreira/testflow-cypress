class JsonPatchBuilder {
  constructor() {
    this.operations = []
  }

  replace(path, value) {
    this.operations.push({ op: 'replace', path, value })
    return this
  }

  add(path, value) {
    this.operations.push({ op: 'add', path, value })
    return this
  }

  remove(path) {
    this.operations.push({ op: 'remove', path })
    return this
  }

  build() {
    return [...this.operations]
  }
}

function createNamePatch(firstName, middleName, lastName) {
  return new JsonPatchBuilder()
    .replace('/name', firstName)
    .replace('/middleName', middleName)
    .replace('/lastName', lastName)
    .build()
}

function extractPatchValues(patches) {
  const values = {}
  patches.forEach(({ path, value }) => {
    const key = path.split('/').filter(Boolean).pop()
    if (key) values[key] = value
  })
  return values
}

function modifyPatchField(patches, path, value) {
  return patches.map((op) => (op.path === path ? { ...op, value } : op))
}

function removePatchField(patches, path) {
  return patches.filter((op) => op.path !== path)
}

module.exports = {
  JsonPatchBuilder,
  createNamePatch,
  extractPatchValues,
  modifyPatchField,
  removePatchField,
}
