const ENV_URLS = {
  local: 'http://localhost:5050',
  staging: process.env.STAGING_URL || 'http://localhost:5050',
  ci: 'http://localhost:5050',
}

function loadConfig(config) {
  const envName = config.env.ENV || 'local'
  const baseUrl = config.env.BASE_URL || ENV_URLS[envName] || ENV_URLS.local

  config.baseUrl = baseUrl
  config.env.BASE_URL = baseUrl
  config.env.ENV = envName

  if (config.env.version) {
    config.env.APP_VERSION = config.env.version
  }

  return config
}

module.exports = { loadConfig }
