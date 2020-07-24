const { parse } = require('intl-messageformat-parser')
const {
  getJSXAttrNode,
  getObjectPropertyNode,
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
  getIsFormatMessageCallExpressionNode,
  getIsDefineMessagesCallExpressionNode,
  getIsFormattedMessageJSXIdentifierNode,
} = require('../utils')

const getStaticStringValue = node => {
  if (node.type === 'Literal') return node.value
  if (getIsStaticTemplateLiteral(node))
    return getStaticTemplateLiteralValue(node)
  if (node.type === 'JSXExpressionContainer')
    return getStaticStringValue(node.expression)
  return null
}

const validateMessageDescriptorObjectExpression = (context, descriptorNode) => {
  const defaultMessagePropNode = getObjectPropertyNode(
    descriptorNode,
    'defaultMessage'
  )
  if (!defaultMessagePropNode || !defaultMessagePropNode.value) return
  const defaultMessage = getStaticStringValue(defaultMessagePropNode.value)
  if (!defaultMessage) return
  try {
    return parse(defaultMessage)
  } catch (e) {
    context.report({
      node: defaultMessagePropNode.value,
      message: 'defaultMessage should be a valid ICU MessageFormat string',
    })
  }
}

module.exports = {
  meta: {
    docs: {
      description: 'valid ICU MessageFormat syntax',
      category: 'Intl',
      recommended: false,
    },
    schema: [],
  },

  create: function (context) {
    return {
      JSXOpeningElement: function (node) {
        if (!getIsFormattedMessageJSXIdentifierNode(node.name)) return
        const defaultMessageAttrNode = getJSXAttrNode(node, 'defaultMessage')
        if (!defaultMessageAttrNode || !defaultMessageAttrNode.value) return
        const defaultMessage = getStaticStringValue(
          defaultMessageAttrNode.value
        )
        if (!defaultMessage) return
        try {
          return parse(defaultMessage)
        } catch (e) {
          context.report({
            node: defaultMessageAttrNode.value,
            message:
              'defaultMessage should be a valid ICU MessageFormat string',
          })
        }
      },
      CallExpression: function (node) {
        if (getIsFormatMessageCallExpressionNode(node)) {
          const [descriptorNode] = node.arguments || []
          return validateMessageDescriptorObjectExpression(
            context,
            descriptorNode
          )
        }
        if (getIsDefineMessagesCallExpressionNode(node)) {
          const [messagesObjectNode = {}] = node.arguments || []
          if (messagesObjectNode.type !== 'ObjectExpression') return
          messagesObjectNode.properties.forEach(node =>
            validateMessageDescriptorObjectExpression(context, node.value)
          )
        }
      },
    }
  },
}
