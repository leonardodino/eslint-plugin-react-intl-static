const {
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
} = require('./static-template-literal-utils')

module.exports = {
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
  validateValuePropertyNode: require('./validate-value-property-node'),
  getDefaultMessageFallback: require('./get-default-message-fallback'),
  getQuotedString: require('./get-quoted-string'),
}
