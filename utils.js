const { join } = require('path')
const { lstatSync, readFileSync } = require('fs')

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
    (propertyNode.key.type !== 'Identifier' &&
      propertyNode.key.type !== 'Literal')
  ) {
    context.report({
      node: propertyNode,
      message: 'dynamic objects are not allowed in "values"',
    })
  }
}

const cache = {}
function getLocalizationValues(context) {
  const { localeFiles, projectRoot } = context.settings

  if (!localeFiles) throw 'localeFiles not in settings'
  if (!Array.isArray(localeFiles)) throw 'localeFiles must be an array'
  if (!localeFiles.length) throw 'localeFiles must be not be empty'

  const [mainFile] = localeFiles
  const fullPath = projectRoot ? join(projectRoot, mainFile) : mainFile

  const mtime = lstatSync(fullPath).mtime.getTime()
  if (!cache || mtime !== cache.mtime) {
    cache.content = JSON.parse(readFileSync(fullPath))
    cache.mtime = mtime
  }

  return cache.content
}

function getDefaultMessageFallback(context, messageId) {
  if (!messageId) return
  return getLocalizationValues(context)[messageId]
}

function getQuotedString(rawString, jsx) {
  if (jsx) return '"' + rawString.replace(/"/g, '\\"') + '"'
  return getQuotedString(rawString, true).replace(/\n/g, '\\n')
}

function getIsStaticTemplateLiteral(node) {
  return (
    node.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  )
}

function getStaticTemplateLiteralValue(node) {
  return node.quasis[0].value.cooked
}

module.exports = {
  validateValuePropertyNode,
  getDefaultMessageFallback,
  getQuotedString,
  getIsStaticTemplateLiteral,
  getStaticTemplateLiteralValue,
}
