function getObjectPropertyNode(node, attrName) {
  if (!node || node.type !== 'ObjectExpression') return
  return node.properties.find(function (propNode) {
    return (
      propNode &&
      propNode.type === 'Property' &&
      propNode.key &&
      propNode.key.type === 'Identifier' &&
      propNode.key.name === attrName
    )
  })
}

module.exports = getObjectPropertyNode
