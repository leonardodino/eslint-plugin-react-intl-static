const {
  validateValuePropertyNode,
  getDefaultMessageFallback,
  getIsStaticTemplateLiteral,
  getQuotedString,
} = require('../utils')
const eslintPluginReact = require('eslint-plugin-react')
const curlyBracePresence = eslintPluginReact.rules['jsx-curly-brace-presence']

function getIsFormattedMessageJSXIdentifierNode(node) {
  return (
    node && node.type === 'JSXIdentifier' && node.name === 'FormattedMessage'
  )
}

function getJSXAttrNode(node, attrName) {
  return node.attributes.find(function(attrNode) {
    return (
      attrNode &&
      attrNode.type === 'JSXAttribute' &&
      attrNode.name &&
      attrNode.name.type === 'JSXIdentifier' &&
      attrNode.name.name === attrName
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
    const curlyBracePresenceInstance = curlyBracePresence.create({
      ...context,
      options: [
        {
          props: 'never',
          children: 'ignore',
        },
      ],
    })

    return {
      JSXOpeningElement: function(node) {
        if (!getIsFormattedMessageJSXIdentifierNode(node.name)) return
        const idAttrNode = getJSXAttrNode(node, 'id')
        const defaultMessageAttrNode = getJSXAttrNode(node, 'defaultMessage')
        const valuesAttrNode = getJSXAttrNode(node, 'values')
        let messageId = null

        node.attributes.forEach(function(attrNode) {
          if (attrNode.type === 'JSXSpreadAttribute') {
            context.report({
              node: attrNode,
              message: 'spreads are not allowed in FormattedMessage',
            })
          }
          if (
            attrNode.type === 'JSXAttribute' &&
            attrNode.value && 
            attrNode.value.type === 'JSXExpressionContainer'
          ) {
            curlyBracePresenceInstance.JSXExpressionContainer(attrNode.value)
          }
        })

        // validate "id" attribute is a static string
        if (!idAttrNode || !idAttrNode.value) {
          context.report({
            node: node,
            message: `"id" attribute must be present`,
          })
        } else if (
          idAttrNode.value.type !== 'Literal' ||
          typeof idAttrNode.value.value !== 'string'
        ) {
          context.report({
            node: idAttrNode,
            message: '"id" attribute must be a static string',
          })
        } else if (idAttrNode.value.value === '') {
          context.report({
            node: idAttrNode,
            message: '"id" attribute must not be empty',
          })
        } else {
          messageId = idAttrNode.value.value
        }

        // validate "defaultMessage" attribute is a static string
        if (!defaultMessageAttrNode || !defaultMessageAttrNode.value) {
          const fallbackMessage = getDefaultMessageFallback(context, messageId)
          context.report({
            node: node,
            message: '"defaultMessage" attribute must be present',
            fix: function(fixer) {
              if (!fallbackMessage) return
              return fixer.insertTextAfter(
                idAttrNode,
                ` defaultMessage=${getQuotedString(fallbackMessage, true)}`
              )
            },
          })
        } else if (
          defaultMessageAttrNode.value.type === 'JSXExpressionContainer'
        ) {
          if (
            defaultMessageAttrNode.value.expression.type === 'TemplateLiteral'
          ) {
            if (
              !getIsStaticTemplateLiteral(
                defaultMessageAttrNode.value.expression
              )
            ) {
              context.report({
                node: defaultMessageAttrNode.value.expression,
                message: '"defaultMessage" attribute must be a static string',
              })
            }
          } else if (
            defaultMessageAttrNode.value.expression.type !== 'Literal' ||
            typeof defaultMessageAttrNode.value.expression.value !== 'string'
          ) {
            context.report({
              node: defaultMessageAttrNode.value.expression,
              message: '"defaultMessage" attribute must be a static string',
            })
          }
        } else if (
          defaultMessageAttrNode.value.type !== 'Literal' ||
          typeof defaultMessageAttrNode.value.value !== 'string'
        ) {
          context.report({
            node: defaultMessageAttrNode.value,
            message: '"defaultMessage" attribute must be a static string',
          })
        } else if (defaultMessageAttrNode.value.value === '') {
          context.report({
            node: defaultMessageAttrNode,
            message: '"defaultMessage" attribute must not be empty',
          })
        }

        // validate static "values" attribute, if it exists
        if (valuesAttrNode) {
          if (
            !valuesAttrNode.value ||
            !valuesAttrNode.value.expression ||
            valuesAttrNode.value.expression.type !== 'ObjectExpression'
          ) {
            context.report({
              node: valuesAttrNode,
              message:
                '"values" attribute must be have an static object as value',
            })
          } else if (valuesAttrNode.value.expression.properties.length === 0) {
            context.report({
              node: valuesAttrNode,
              message: 'empty objects are not accepted as values, remove it',
            })
          } else {
            valuesAttrNode.value.expression.properties.forEach(function(
              propertyNode
            ) {
              validateValuePropertyNode(context, propertyNode)
            })
          }
        }
      },
    }
  },
}
