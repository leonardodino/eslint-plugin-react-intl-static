const {
  extractValuesFromIcuAst,
  extractValuesFromObjectExpression,
  getJSXAttrNode,
  getIsFormatMessageCallExpressionNode,
  getIsFormattedMessageJSXIdentifierNode,
} = require('../utils')

const validateIcuSyntax = require('./validate-icu-syntax')

const validateValues = (context, ast, node, valuesNode) => {
  if (!ast) return
  const requiredKeys = Object.keys(extractValuesFromIcuAst(ast))
  if (!requiredKeys.length) return
  if (!valuesNode) {
    const list = requiredKeys.map(key => `"${key}"`).join(', ')
    context.report({
      node,
      message: `defaultMessage require the follwing values to be present: ${list}.`,
    })
    return
  }
  const availableValues = extractValuesFromObjectExpression(valuesNode)
  const missingKeys = requiredKeys.filter(key => !availableValues[key])
  missingKeys.forEach(key => {
    context.report({
      node: valuesNode,
      message: `missing required value "${key}". please add it here, or fix defaultMessage`,
    })
  })
}

module.exports = {
  meta: {
    docs: {
      description: 'valid ICU MessageFormat values',
      category: 'Intl',
      recommended: true,
    },
    schema: [],
  },

  create: function(context) {
    const validateIcuSyntaxInstance = validateIcuSyntax.create(context)
    return {
      JSXOpeningElement: function(node) {
        const ast = validateIcuSyntaxInstance.JSXOpeningElement(node)
        if (!getIsFormattedMessageJSXIdentifierNode(node.name)) return
        const valuesAttrNode = getJSXAttrNode(node, 'values')
        const valuesNode =
          valuesAttrNode &&
          valuesAttrNode.value &&
          valuesAttrNode.value.expression
        validateValues(context, ast, node, valuesNode)
      },
      CallExpression: function(node) {
        const ast = validateIcuSyntaxInstance.CallExpression(node)
        if (!getIsFormatMessageCallExpressionNode(node)) return
        const [_, valuesNode] = node.arguments || []
        validateValues(context, ast, node, valuesNode)
      },
    }
  },
}
