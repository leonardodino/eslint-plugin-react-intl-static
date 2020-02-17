function getIsStaticTemplateLiteral(node) {
  return (
    node &&
    node.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  )
}

function getStaticTemplateLiteralValue(node) {
  return node.quasis[0].value.cooked
}

module.exports = { getIsStaticTemplateLiteral, getStaticTemplateLiteralValue }
