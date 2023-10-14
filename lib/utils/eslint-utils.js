// shims for wider eslint compatibility

function getSourceCode(context) {
  /* c8 ignore next */
  return context.sourceCode ?? context.getSourceCode()
}

function getScope(context, node) {
  /* c8 ignore next */
  return getSourceCode(context).getScope?.(node) ?? context.getScope()
}

module.exports = {
  getSourceCode,
  getScope,
}
