// shims for wider eslint compatibility

function getSourceCode(context) {
  return context.sourceCode ?? context.getSourceCode()
}

function getScope(context, node) {
  return getSourceCode(context).getScope?.(node) ?? context.getScope()
}

module.exports = {
  getSourceCode,
  getScope,
}
