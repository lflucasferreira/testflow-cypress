const ENV_URLS = {
  local: 'http://localhost:5050',
  staging: process.env.STAGING_URL || process.env.CYPRESS_STAGING_URL,
  ci: 'http://localhost:5050',
}

function resolveBaseUrl(envName, config) {
  if (config.env.BASE_URL && config.env.BASE_URL !== 'http://localhost:5050') {
    return config.env.BASE_URL
  }

  const fromEnv = ENV_URLS[envName]
  if (fromEnv) return fromEnv

  if (envName === 'staging') {
    throw new Error(
      'Staging environment requires STAGING_URL or CYPRESS_STAGING_URL to be set',
    )
  }

  return ENV_URLS.local
}

function loadConfig(config) {
  const envName = config.env.ENV || 'local'
  const baseUrl = resolveBaseUrl(envName, config)

  config.baseUrl = baseUrl
  config.env.BASE_URL = baseUrl
  config.env.ENV = envName

  if (config.env.version) {
    config.env.APP_VERSION = config.env.version
  }

  return config
}

module.exports = { loadConfig, ENV_URLS }
