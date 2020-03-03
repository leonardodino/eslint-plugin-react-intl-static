function getIsIdentifierProperty(propNode) {
  return (
    propNode &&
    propNode.type === 'Property' &&
    propNode.computed === false &&
    propNode.key &&
    propNode.key.type === 'Identifier'
  )
}

function getIsLiteralProperty(propNode) {
  return (
    propNode &&
    propNode.type === 'Property' &&
    propNode.key &&
    propNode.key.type === 'Literal'
  )
}

function extractValuesFromObjectExpression(node) {
  if (!node || node.type !== 'ObjectExpression') return {}
  return node.properties.reduce((values, propertyNode) => {
    if (getIsIdentifierProperty(propertyNode)) {
      values[propertyNode.key.name] = true
    }
    if (getIsLiteralProperty(propertyNode)) {
      values[propertyNode.key.value] = true
    }
    return values
  }, {})
}

module.exports = extractValuesFromObjectExpression
