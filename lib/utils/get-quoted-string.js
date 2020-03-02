function getQuotedString(rawString, jsx) {
  if (jsx) return '"' + rawString.replace(/"/g, '\\"') + '"'
  return getQuotedString(rawString, true).replace(/\n/g, '\\n')
}

module.exports = getQuotedString
