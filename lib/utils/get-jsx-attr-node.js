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

module.exports = getJSXAttrNode
