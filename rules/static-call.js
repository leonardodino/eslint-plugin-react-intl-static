const {
  validateValuePropertyNode,
  getDefaultMessageFallback,
  getQuotedString,
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
} = require('../utils')

function getIsFormatMessageIdentifier(node) {
  return node.type === 'Identifier' && node.name === 'formatMessage'
}

function getIsFormatMessageCallExpressionNode(node) {
  return (
    node &&
    node.type === 'CallExpression' &&
    (getIsFormatMessageIdentifier(node.callee) ||
      (node.callee.type === 'MemberExpression' &&
        getIsFormatMessageIdentifier(node.callee.property)))
  )
}

function getObjectPropertyNode(node, attrName) {
  return node.properties.find(function(propNode) {
    return (
      propNode &&
      propNode.type === 'Property' &&
      propNode.key &&
      propNode.key.type === 'Identifier' &&
      propNode.key.name === attrName
    )
  })
}

module.exports = {
  meta: {
    docs: {
      description: 'static definition',
      category: 'Intl',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create: function(context) {
    return {
      CallExpression: function(node) {
        if (!getIsFormatMessageCallExpressionNode(node)) return
        const [descriptorNode, valuesNode] = node.arguments || []
        let messageId = null

        // validate first argument
        if (!descriptorNode) {
          context.report({
            node: descriptorNode,
            message: 'message descriptor is required in "formatMessage"',
          })
        } else if (descriptorNode.type !== 'ObjectExpression') {
          context.report({
            node: descriptorNode,
            message:
              'message descriptor must be a static object in "formatMessage"',
          })
        } else {
          const idPropNode = getObjectPropertyNode(descriptorNode, 'id')
          const defaultMessagePropNode = getObjectPropertyNode(
            descriptorNode,
            'defaultMessage'
          )

          descriptorNode.properties.forEach(function(propNode) {
            if (propNode && propNode.type === 'SpreadElement') {
              context.report({
                node: propNode,
                message: 'spreads are not allowed in formatMessage',
              })
            }
          })

          // validate "id" property is a static string
          if (!idPropNode || !idPropNode.value) {
            context.report({
              node: idPropNode || node,
              message: `"id" property must be present, and have a value`,
            })
          } else if (
            idPropNode.value.type !== 'Literal' ||
            typeof idPropNode.value.value !== 'string'
          ) {
            context.report({
              node: idPropNode.value,
              message: '"id" property must be a literal string',
              fix: function(fixer) {
                if (!getIsStaticTemplateLiteral(idPropNode.value)) return
                return fixer.replaceText(
                  idPropNode.value,
                  getQuotedString(
                    getStaticTemplateLiteralValue(idPropNode.value)
                  )
                )
              },
            })
          } else if (idPropNode.value.value === '') {
            context.report({
              node: idPropNode,
              message: '"id" property must not be empty',
            })
          } else {
            messageId = idPropNode.value.value
          }

          // validate "defaultMessage" property is a static string
          if (!defaultMessagePropNode || !defaultMessagePropNode.value) {
            const fallbackMessage = getDefaultMessageFallback(
              context,
              messageId
            )

            context.report({
              node: defaultMessagePropNode || node,
              message:
                '"defaultMessage" property must be present, and have a value',
              fix: function(fixer) {
                if(!fallbackMessage) return
                return fixer.insertTextAfter(
                  idPropNode,
                  `, defaultMessage: ${getQuotedString(fallbackMessage)}`
                )
              },
            })
          } else if (
            (defaultMessagePropNode.value.type !== 'Literal' ||
              typeof defaultMessagePropNode.value.value !== 'string') &&
            !getIsStaticTemplateLiteral(defaultMessagePropNode.value)
          ) {
            context.report({
              node: defaultMessagePropNode.value,
              message:
                '"defaultMessage" property must be a string or a static template',
            })
          } else if (defaultMessagePropNode.value.value === '') {
            context.report({
              node: defaultMessagePropNode,
              message: '"defaultMessage" property must not be empty',
              fix: function(fixer) {
                return fixer.remove(defaultMessagePropNode)
              },
            })
          }
        }

        // validate second argument, if it exists
        if (valuesNode) {
          if (valuesNode.type !== 'ObjectExpression') {
            context.report({
              node: valuesNode,
              message:
                '"values" argument must be have an static object as value',
            })
          } else if (valuesNode.properties.length === 0) {
            context.report({
              node: valuesNode,
              message: 'empty objects are not accepted as values, remove it',
            })
          } else {
            valuesNode.properties.forEach(function(propertyNode) {
              validateValuePropertyNode(context, propertyNode)
            })
          }
        }
      },
    }
  },
}
