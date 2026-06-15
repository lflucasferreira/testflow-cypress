const fs = require('fs')
const path = require('path')

function registerTasks(on) {
  on('task', {
    logJson({ label, data }) {
      // eslint-disable-next-line no-console
      console.log(`[${label}]`, JSON.stringify(data, null, 2))
      return null
    },

    log(message) {
      // eslint-disable-next-line no-console
      console.log(message)
      return null
    },

    resetUserProfile({ userId }) {
      // eslint-disable-next-line no-console
      console.log(`[task:resetUserProfile] userId=${userId} (no-op in TestFlow sandbox)`)
      return null
    },

    setComplianceFlag({ userId, flag }) {
      // eslint-disable-next-line no-console
      console.log(`[task:setComplianceFlag] userId=${userId} flag=${flag}`)
      return null
    },

    readFixture(relativePath) {
      const fullPath = path.join(__dirname, '../fixtures', relativePath)
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    },
  })
}

module.exports = { registerTasks }
