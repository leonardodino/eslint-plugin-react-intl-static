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
    propertyNode.key.type !== 'Identifier'
  ) {
    context.report({
      node: propertyNode,
      message: 'dynamic objects are not allowed in "values"',
    })
  }
}

module.exports = {
  validateValuePropertyNode,
}
