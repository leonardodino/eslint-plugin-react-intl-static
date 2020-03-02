const { join } = require('path')
const { lstatSync, readFileSync } = require('fs')

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

module.exports = getDefaultMessageFallback
