/**
 * Shared axe-core options for TestFlow pages.
 * Known app-level contrast/structure issues are excluded and documented here.
 */

const TESTFLOW_KNOWN_EXCLUSIONS = {
  // Demo pages include decorative markup; tune per page if axe reports false positives.
  region: { enabled: false },
}

const A11Y_PRESETS = {
  critical: {
    includedImpacts: ['critical'],
  },
  standard: {
    includedImpacts: ['critical', 'serious'],
    rules: TESTFLOW_KNOWN_EXCLUSIONS,
  },
}

function getA11yOptions(preset = 'critical') {
  return A11Y_PRESETS[preset] || A11Y_PRESETS.critical
}

module.exports = { A11Y_PRESETS, getA11yOptions, TESTFLOW_KNOWN_EXCLUSIONS }
