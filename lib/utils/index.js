const {
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
} = require('./static-template-literal-utils')

const {
  getIsFormatMessageCallExpressionNode,
  getIsDefineMessagesCallExpressionNode,
  getIsFormattedMessageJSXIdentifierNode,
} = require('./usage-check-utils')

module.exports = {
  extractValuesFromIcuAst: require('./extract-values-from-icu-ast'),
  extractValuesFromObjectExpression: require('./extract-values-from-object-expression'),
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
  validateValuePropertyNode: require('./validate-value-property-node'),
  getDefaultMessageFallback: require('./get-default-message-fallback'),
  getQuotedString: require('./get-quoted-string'),
  getJSXAttrNode: require('./get-jsx-attr-node'),
  getObjectPropertyNode: require('./get-object-property-node'),
  getIsFormatMessageCallExpressionNode,
  getIsDefineMessagesCallExpressionNode,
  getIsFormattedMessageJSXIdentifierNode,
}
