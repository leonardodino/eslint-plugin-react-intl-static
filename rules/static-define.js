const {
  getDefaultMessageFallback,
  getQuotedString,
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
} = require('../utils')

function getIsDefineMessagesIdentifier(node) {
  return node.type === 'Identifier' && node.name === 'defineMessages'
}

function getIsDefineMessagesCallExpressionNode(node) {
  return (
    node &&
    node.type === 'CallExpression' &&
    (getIsDefineMessagesIdentifier(node.callee) ||
      (node.callee.type === 'MemberExpression' &&
        getIsDefineMessagesIdentifier(node.callee.property)))
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
        if (!getIsDefineMessagesCallExpressionNode(node)) return
        const [messagesObjectNode] = node.arguments || []

        if (!messagesObjectNode) {
          context.report({
            node: node,
            message: 'messages is required in "defineMessages"',
          })
          return
        } else if (messagesObjectNode.type !== 'ObjectExpression') {
          context.report({
            node: messagesObjectNode,
            message: 'messages must be a static object in "defineMessages"',
          })
          return
        }

        messagesObjectNode.properties.forEach(descriptorNode => {
          let messageId = null
          if (descriptorNode.type === 'SpreadElement') {
            context.report({
              node: descriptorNode,
              message: 'spreads are not allowed in defineMessages',
            })
            return
          } else if (
            descriptorNode.type === 'Property' &&
            descriptorNode.computed
          ) {
            context.report({
              node: descriptorNode,
              message:
                'computed properties are not allowed in defineMessages keys',
            })
          } else if (
            descriptorNode.type !== 'Property' ||
            descriptorNode.kind !== 'init' ||
            (descriptorNode.key.type !== 'Identifier' &&
              descriptorNode.key.type !== 'Literal')
          ) {
            context.report({
              node: descriptorNode,
              message: 'dynamic objects are not allowed in defineMessages keys',
            })
          }

          if (
            descriptorNode.type !== 'Property' ||
            descriptorNode.value.type !== 'ObjectExpression'
          ) {
            context.report({
              node: descriptorNode,
              message: 'only static messages are allowed in defineMessages',
            })
            return
          }

          const idPropNode = getObjectPropertyNode(descriptorNode.value, 'id')
          const defaultMessagePropNode = getObjectPropertyNode(
            descriptorNode.value,
            'defaultMessage'
          )

          descriptorNode.value.properties.forEach(function(propNode) {
            if (propNode && propNode.type === 'SpreadElement') {
              context.report({
                node: propNode,
                message: 'spreads are not allowed in defineMessages',
              })
            }
          })

          // validate "id" property is a static string
          if (!idPropNode || !idPropNode.value) {
            context.report({
              node: idPropNode || descriptorNode,
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
              node: defaultMessagePropNode || descriptorNode,
              message:
                '"defaultMessage" property must be present, and have a value',
              fix: function(fixer) {
                if (!fallbackMessage) return
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
        })
      },
    }
  },
}
