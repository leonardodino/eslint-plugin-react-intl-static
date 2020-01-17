function validateValuePropertyNode(context, propertyNode) {
  if (propertyNode.type === 'SpreadElement') {
    context.report({
      node: propertyNode,
      message: 'spreads are not allowed in "values"',
    })
  } else if (propertyNode.type === 'Property' && propertyNode.computed) {
    context.report({
      node: propertyNode,
      message: 'computed properties are not allowed in "values"',
    })
  } else if (
    propertyNode.type !== 'Property' ||
    propertyNode.kind !== 'init' ||
    (propertyNode.key.type !== 'Identifier' && propertyNode.key.type !== 'Literal')
  ) {
    context.report({
      node: propertyNode,
      message: 'dynamic objects are not allowed in "values"',
    })
  }
}


function getIsStaticTemplateLiteral(node) {
  return (
    node.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  )
}
module.exports = {
  validateValuePropertyNode,
  getIsStaticTemplateLiteral,
}
