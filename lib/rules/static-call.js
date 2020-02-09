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

function findVariableInScope(scope, variableName) {
  const found = scope.variables.find(variable => variable.name === variableName)
  return (
    found || (scope.upper && findVariableInScope(scope.upper, variableName))
  )
}
function getVariableDefinitions(context, variableName) {
  const scope = context.getScope()
  const variable = findVariableInScope(scope, variableName)
  return (variable && variable.defs) || []
}
function getStaticObjectKeys(objectExpressionNode) {
  return objectExpressionNode.properties
    .filter(propertyNode => {
      if (propertyNode.type !== 'Property') return false
      if (propertyNode.kind !== 'init') return false
      if (propertyNode.computed) return false
      return (
        propertyNode.key.type === 'Literal' ||
        propertyNode.key.type === 'Identifier'
      )
    })
    .map(propertyNode => {
      return propertyNode.key.name || propertyNode.key.value
    })
}

function getIsDefinedMessage(context, descriptorNode) {
  if (!descriptorNode) return false
  if (
    descriptorNode.type === 'LogicalExpression' &&
    ['||', '??'].includes(descriptorNode.operator)
  ) {
    const problems = []
    const report = context.report
    context.report = problem => problems.push(problem)
    const valid = [descriptorNode.left, descriptorNode.right].every(node =>
      getIsDefinedMessage(context, node)
    )
    context.report = report
    if (valid) problems.forEach(problem => context.report(problem))
    return valid
  }

  if (descriptorNode.type !== 'MemberExpression') return false
  if (descriptorNode.object.type !== 'Identifier') return false

  const name = descriptorNode.object.name
  const [definition, ...redefs] = getVariableDefinitions(context, name)
  if (redefs.length !== 0) return false
  if (!definition || definition.type !== 'Variable') return false
  if (definition.node.init.type !== 'CallExpression') return false
  if (definition.node.init.callee.type !== 'Identifier') return false
  if (definition.node.init.callee.name !== 'defineMessages') return false

  if (definition.parent.kind !== 'const') {
    context.report({
      node: definition.parent,
      message: "message definitions should use 'const'",
    })
  }

  if (
    !descriptorNode.computed &&
    descriptorNode.property.type === 'Identifier'
  ) {
    // try to validate non-computed property access of messages
    try {
      const keyName = descriptorNode.property.name
      const definedMessagesNode = definition.node.init.arguments[0]
      const validMessageKeys = getStaticObjectKeys(definedMessagesNode)
      if (!validMessageKeys.includes(keyName)) {
        context.report({
          node: descriptorNode.property,
          message: `property "${keyName}" not found on defined messages object "${name}"`,
        })
      }
    } catch (e) {
      // ignore errors here, the defineMessages call can be in an invalid format
      // violations in that definition are picked up by the static-define rule
    }
  }

  return true
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
        if (getIsDefinedMessage(context, descriptorNode)) {
          // skip checking, it was validated via `defineMessages`
        } else if (!descriptorNode) {
          context.report({
            node: node,
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
              fix: function*(fixer) {
                const node = defaultMessagePropNode
                yield fixer.remove(node)
                const nextToken = context.getSourceCode().getTokenAfter(node)
                if (nextToken.value === ',') yield fixer.remove(nextToken)
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
