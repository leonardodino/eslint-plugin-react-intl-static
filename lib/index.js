module.exports = {
  rules: {
    'static-define': require('./rules/static-define'),
    'static-jsx': require('./rules/static-jsx'),
    'static-call': require('./rules/static-call'),
    'static-icu-values': require('./rules/static-icu-values'),
    'sync-messages': require('./rules/sync-messages'),
  },
}
