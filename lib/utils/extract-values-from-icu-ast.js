const walk = require('estree-walk')
const { TYPE } = require('intl-messageformat-parser')

const extractValuesFromIcuAst = (ast) => {
  const values = {}
  for (const queue = ast; queue.length; ) {
    const node = queue.pop()
    if (node.type !== TYPE.literal && node.value) values[node.value] = true
    if (node.type === TYPE.select || node.type === TYPE.plural) {
      Object.values(node.options || {}).forEach((option) => {
        if (!option.value) return
        Object.assign(values, extractValuesFromIcuAst(option.value))
      })
    }
    walk.step(node, queue)
  }
  return values
}

module.exports = extractValuesFromIcuAst
