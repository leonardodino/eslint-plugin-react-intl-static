const {
  getDefaultMessageFallback,
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
} = require('../utils')

function getCanonicalValue(string) {
  return string
    .trim()
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}')
    .replace(/\s*?=0\s*?/, ' zero ')
    .replace(/\s*?=1\s*?/, ' one ')
    .replace(/\s+/g, ' ')
}

function translationsAreEqual(string1, string2, name, node) {
  if (typeof string1 !== 'string') return false
  if (typeof string2 !== 'string') return false
  const cString1 = getCanonicalValue(string1)
  const cString2 = getCanonicalValue(string2)
  const equal = cString1 === cString2
  if (!equal) {
    console.log(cString1)
    console.log(cString2)
    console.log('')
  }
  return equal
}

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

function getIsFormattedMessageJSXIdentifierNode(node) {
  return (
    node && node.type === 'JSXIdentifier' && node.name === 'FormattedMessage'
  )
}

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

const createRemovePropNode = (context, propNode) =>
  function*(fixer) {
    yield fixer.remove(propNode)
    const nextToken = context.getSourceCode().getTokenAfter(propNode)
    if (nextToken.value === ',') yield fixer.remove(nextToken)
  }

function handleFormatMessageCallExpression(context, node) {
  if (!getIsFormatMessageCallExpressionNode(node)) return
  const [descriptorNode] = node.arguments || []

  // validate first argument
  if (!descriptorNode || descriptorNode.type !== 'ObjectExpression') return

  const idPropNode = getObjectPropertyNode(descriptorNode, 'id')
  const defaultMessagePropNode = getObjectPropertyNode(
    descriptorNode,
    'defaultMessage'
  )
  // validate "id" property is a static string
  if (!idPropNode || !idPropNode.value) return
  if (
    idPropNode.value.type !== 'Literal' ||
    typeof idPropNode.value.value !== 'string'
  )
    return

  const messageId = idPropNode.value.value
  const fallbackMessage = getDefaultMessageFallback(context, messageId)
  if (!fallbackMessage) {
    context.report({
      node: node,
      message: `could not find default message found for "${messageId}"`,
    })
    return
  }

  // validate "defaultMessage" property is a static string
  if (!defaultMessagePropNode || !defaultMessagePropNode.value) return
  if (
    getIsStaticTemplateLiteral(defaultMessagePropNode.value) &&
    translationsAreEqual(
      getStaticTemplateLiteralValue(defaultMessagePropNode.value),
      fallbackMessage
    )
  )
    return
  if (translationsAreEqual(defaultMessagePropNode.value.value, fallbackMessage))
    return

  context.report({
    node: defaultMessagePropNode.value,
    message: 'mismatched message, please update',
    fix: createRemovePropNode(context, defaultMessagePropNode),
  })
}

function handleDefineMessagesCallExpression(context, node) {
  if (!getIsDefineMessagesCallExpressionNode(node)) return
  const [messagesObjectNode] = node.arguments || []
  if (!messagesObjectNode || messagesObjectNode.type !== 'ObjectExpression')
    return

  messagesObjectNode.properties.forEach(descriptorNode => {
    if (
      descriptorNode.type !== 'Property' ||
      descriptorNode.kind !== 'init' ||
      (descriptorNode.key.type !== 'Identifier' &&
        descriptorNode.key.type !== 'Literal')
    )
      return

    if (
      descriptorNode.type !== 'Property' ||
      descriptorNode.value.type !== 'ObjectExpression'
    )
      return

    const idPropNode = getObjectPropertyNode(descriptorNode.value, 'id')
    const defaultMessagePropNode = getObjectPropertyNode(
      descriptorNode.value,
      'defaultMessage'
    )

    // validate "id" property is a static string
    if (!idPropNode || !idPropNode.value) return
    if (
      idPropNode.value.type !== 'Literal' ||
      typeof idPropNode.value.value !== 'string'
    )
      return

    const messageId = idPropNode.value.value
    const fallbackMessage = getDefaultMessageFallback(context, messageId)
    if (!fallbackMessage) {
      context.report({
        node: node,
        message: `could not find default message found for "${messageId}"`,
      })
      return
    }

    // validate "defaultMessage" property is a static string
    if (!defaultMessagePropNode || !defaultMessagePropNode.value) return
    if (
      getIsStaticTemplateLiteral(defaultMessagePropNode.value) &&
      translationsAreEqual(
        getStaticTemplateLiteralValue(defaultMessagePropNode.value),
        fallbackMessage
      )
    )
      return

    if (
      translationsAreEqual(defaultMessagePropNode.value.value, fallbackMessage)
    )
      return

    context.report({
      node: defaultMessagePropNode.value,
      message: 'mismatched message, please update',
      fix: createRemovePropNode(context, defaultMessagePropNode),
    })
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
      JSXOpeningElement: function(node) {
        if (!getIsFormattedMessageJSXIdentifierNode(node.name)) return
        const idAttrNode = getJSXAttrNode(node, 'id')

        // validate "id" attribute is a static string
        if (
          !idAttrNode ||
          !idAttrNode.value ||
          idAttrNode.value.type !== 'Literal' ||
          typeof idAttrNode.value.value !== 'string' ||
          !idAttrNode.value.value
        ) {
          return
        }
        const messageId = idAttrNode.value.value
        const fallbackMessage = getDefaultMessageFallback(context, messageId)
        if (!fallbackMessage) {
          context.report({
            node: node,
            message: `could not find default message found for "${messageId}"`,
          })
          return
        }

        const defaultMessageAttrNode = getJSXAttrNode(node, 'defaultMessage')

        // element without defaultMessage, already fixed by static-jsx
        if (!defaultMessageAttrNode || !defaultMessageAttrNode.value) return
        if (
          getIsStaticTemplateLiteral(defaultMessageAttrNode.value.expression) &&
          translationsAreEqual(
            getStaticTemplateLiteralValue(
              defaultMessageAttrNode.value.expression
            ),
            fallbackMessage
          )
        )
          return

        if (
          defaultMessageAttrNode.value.expression &&
          translationsAreEqual(
            defaultMessageAttrNode.value.expression.value,
            fallbackMessage
          )
        )
          return

        if (
          defaultMessageAttrNode.value.value &&
          translationsAreEqual(
            defaultMessageAttrNode.value.value,
            fallbackMessage
          )
        )
          return

        // remove it otherwise
        context.report({
          node: defaultMessageAttrNode.value,
          message: 'mismatched message, please update',
          fix: function(fixer) {
            return fixer.remove(defaultMessageAttrNode)
          },
        })
      },
      CallExpression: function(node) {
        handleFormatMessageCallExpression(context, node)
        handleDefineMessagesCallExpression(context, node)
      },
    }
  },
}
