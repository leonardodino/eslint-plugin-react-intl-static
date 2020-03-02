const { basename } = require('path')
const { RuleTester } = require('eslint')
const { vol } = require('memfs')

jest.mock('fs', () => require('memfs').fs)

const test = (locale, localeFile = 'src/locales/en_GB.json') => {
  beforeAll(() => vol.fromJSON({ [localeFile]: JSON.stringify(locale) }))
  afterAll(() => vol.reset())

  const name = basename(require.main.filename, '.js')
  const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: { ecmaFeatures: { jsx: true } },
    settings: { localeFiles: [localeFile] },
  })

  return (rule, tests) => ruleTester.run(name, rule, tests)
}

module.exports = test
