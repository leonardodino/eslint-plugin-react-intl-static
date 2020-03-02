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

module.exports = {
  getIsFormatMessageCallExpressionNode,
  getIsDefineMessagesCallExpressionNode,
  getIsFormattedMessageJSXIdentifierNode,
}
