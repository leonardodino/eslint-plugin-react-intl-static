# eslint-plugin-react-intl-static
[![npm](https://img.shields.io/npm/v/eslint-plugin-react-intl-static)](https://www.npmjs.com/package/eslint-plugin-react-intl-static)
[![Build Status](https://travis-ci.com/leonardodino/eslint-plugin-react-intl-static.svg?branch=master)](https://travis-ci.com/leonardodino/eslint-plugin-react-intl-static)
[![Code Coverage](https://badgen.net/codecov/c/github/leonardodino/eslint-plugin-react-intl-static)](https://codecov.io/gh/leonardodino/eslint-plugin-react-intl-static)

rules to enforce statically analysable react-intl usage.

# Roadmap

### v0.0.0
- [x] detect basic violations in `<FormattedMessage />`
- [x] detect basic violations in `formatMessage({})`
- [x] detect basic violations in `defineMessages({})`
- [x] basic fixes for `<FormattedMessage />`
- [x] basic fixes for `formatMessage({})`
- [x] basic fixes for `defineMessages({})`
- [x] handle basic interaction of `defineMessages` + `formatMessage`
- [x] handle fallback interaction of `defineMessages` + `formatMessage`
- [x] add option for allowing computed keys in `defineMessages`

### v0.0.1
- [x] follow [default eslint repo format](https://github.com/eslint/generator-eslint)
- [x] add [tests](https://eslint.org/docs/developer-guide/nodejs-api#ruletester)
- [ ] add docs

### v0.1.0
- [ ] disallow renaming/aliasing of functions/imports
- [ ] disallow passing `formatMessage` as a positional argument

### v0.2.0
- [ ] move to typescript
- [ ] remove this roadmap

### v0.3.0
- [ ] separate useful functions into it's own package
- [ ] monorepo, maybe :thinking:
