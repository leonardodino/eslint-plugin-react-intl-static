const test = require('../../../lib/test-utils')
const rule = require('../../../lib/rules/static-call')

const locale = { greeting: 'hello', hello: 'hello {name}' }

const definition = `
  const defined = defineMessages({
    key: { id: 'greeting', defaultMessage: 'hello' }
  })
`
  .replace(/\s+/g, ' ')
  .trim()

test(locale)(rule, {
  valid: [
    'anyFunction()',
    'formatMessage({id: "greeting", defaultMessage: "hello"})',
    'formatMessage({id: "hello", defaultMessage: `hello {name}`}, {name})',
    `${definition}; formatMessage(defined.key)`,
    `${definition}; () => formatMessage(defined.key)`,
    `${definition}; formatMessage(defined[id])`,
    `${definition}; formatMessage(defined[id] || defined.key)`,
  ],
  invalid: [
    {
      code: 'this.props.randomStuff.formatMessage()',
      errors: ['message descriptor is required in "formatMessage"'],
    },
    {
      code: `${definition}; formatMessage(defined[id] || defined.prop)`,
      errors: [
        'property "prop" not found on defined messages object "defined"',
      ],
    },
    {
      code: `${definition}; formatMessage(defined.prop, {'name': 'ok'})`,
      errors: [
        'property "prop" not found on defined messages object "defined"',
      ],
    },
    {
      code: `${definition}; formatMessage(defined)`,
      errors: ['message descriptor must be a static object in "formatMessage"'],
    },
    {
      code: `${definition.replace(
        /defineMessages/,
        ''
      )}; formatMessage(defined.key)`,
      errors: ['message descriptor must be a static object in "formatMessage"'],
    },
    {
      code: `${definition.replace(
        /defineMessages/,
        'anotherFunction'
      )}; formatMessage(defined.key)`,
      errors: ['message descriptor must be a static object in "formatMessage"'],
    },
    {
      code: `${definition.replace(/const/, 'let')}; formatMessage(defined.key)`,
      errors: ["message definitions should use 'const'"],
    },
    {
      code: 'intl.formatMessage({}, {})',
      errors: [
        '"id" property must be present, and have a value',
        '"defaultMessage" property must be present, and have a value',
        'empty objects are not accepted as values, remove it',
      ],
    },
    {
      code: 'intl.formatMessage({...props.message}, {...props.values})',
      errors: [
        '"id" property must be present, and have a value',
        '"defaultMessage" property must be present, and have a value',
        'spreads are not allowed in formatMessage',
        'spreads are not allowed in "values"',
      ],
    },
    {
      code: 'formatMessage({id: "", defaultMessage: "a", ...props.message})',
      errors: [
        '"id" property must not be empty',
        'spreads are not allowed in formatMessage',
      ],
    },
    {
      code: 'formatMessage({id: "greeting", defaultMessage: ""})',
      output: 'formatMessage({id: "greeting", })',
      errors: ['"defaultMessage" property must not be empty'],
    },
    {
      code: 'formatMessage({id: "greeting", defaultMessage: "",})',
      output: 'formatMessage({id: "greeting", })',
      errors: ['"defaultMessage" property must not be empty'],
    },
    {
      code: 'formatMessage({id: "greeting", })',
      output: 'formatMessage({id: "greeting", defaultMessage: "hello", })',
      errors: ['"defaultMessage" property must be present, and have a value'],
    },
    {
      code: 'formatMessage({id: `a`, defaultMessage: "a"})',
      output: 'formatMessage({id: "a", defaultMessage: "a"})',
      errors: ['"id" property must be a literal string'],
    },
    {
      code: 'formatMessage({id: `hello.${id}`, defaultMessage: "hello"})',
      errors: ['"id" property must be a literal string'],
    },
    {
      code: 'formatMessage(defined.key || defined[id], props.values)',
      errors: [
        'message descriptor must be a static object in "formatMessage"',
        '"values" argument must be have an static object as value',
      ],
    },
    {
      code: 'formatMessage({id: "a", defaultMessage: `${name}`}, {[a]: 2})',
      errors: [
        '"defaultMessage" property must be a string or a static template',
        'computed properties are not allowed in "values"',
      ],
    },
    {
      code: 'formatMessage({id: "a", defaultMessage: "{name}"}, {get name() {return "no"}})',
      errors: ['dynamic objects are not allowed in "values"'],
    },
  ],
})
