const test = require('../../../lib/test-utils')
const rule = require('../../../lib/rules/static-define')

const locale = { greeting: 'hello', hello: 'hello {name}' }

test(locale)(rule, {
  valid: [
    'anyOtherFunction()',
    'defineMessages({ key: {id: "greeting", defaultMessage: "hello"} })',
    'defineMessages({ [key]: {id:"greeting", defaultMessage: "hello"} })',
    `const defined = defineMessages({
      key1: { id: 'key.id.1', defaultMessage: 'message 1' },
      key2: { id: 'key.id.2', defaultMessage: 'message 2' },
    })`,
  ],
  invalid: [
    {
      code: 'defineMessages()',
      errors: ['messages is required in "defineMessages"'],
    },
    {
      code: 'defineMessages([])',
      errors: ['messages must be a static object in "defineMessages"'],
    },
    {
      code: 'defineMessages(MESSAGES)',
      errors: ['messages must be a static object in "defineMessages"'],
    },
    {
      code: 'defineMessages({ ...MESSAGES })',
      errors: ['spreads are not allowed in defineMessages'],
    },
    {
      code: 'defineMessages({ get id() { return "wat" } })',
      errors: [
        'dynamic objects are not allowed in defineMessages keys',
        'only static messages are allowed in defineMessages',
      ],
    },
    {
      code: 'defineMessages({id: "greeting", defaultMessage: "hello"})',
      errors: [
        'only static messages are allowed in defineMessages',
        'only static messages are allowed in defineMessages',
      ],
    },
    {
      code: 'defineMessages({ key: { id:"greeting", ...something } })',
      output:
        'defineMessages({ key: { id:"greeting", defaultMessage: "hello", ...something } })',
      errors: [
        '"defaultMessage" property must be present, and have a value',
        'spreads are not allowed in defineMessages',
      ],
    },
    {
      code: 'defineMessages({key:{id:"greeting"}})',
      output: 'defineMessages({key:{id:"greeting", defaultMessage: "hello"}})',
      errors: ['"defaultMessage" property must be present, and have a value'],
    },
    {
      code: 'defineMessages({[key]:{id:"greeting", defaultMessage: "hello"}})',
      options: [{ allowComputed: false }],
      errors: ['computed properties are not allowed in defineMessages keys'],
    },
    {
      code: `const defined = defineMessages({
        key1: { defaultMessage: 'message 1' },
        key2: { id: '', defaultMessage: 'message 2' },
        key3: { id: \`key.id.3\`, defaultMessage: 'message 3' },
        key4: { id: \`key.id.\${n}\`, defaultMessage: \`message \${n}\` },
        key5: { id: 'key.id.5', defaultMessage: '' },
      })`,
      output: `const defined = defineMessages({
        key1: { defaultMessage: 'message 1' },
        key2: { id: '', defaultMessage: 'message 2' },
        key3: { id: "key.id.3", defaultMessage: 'message 3' },
        key4: { id: \`key.id.\${n}\`, defaultMessage: \`message \${n}\` },
        key5: { id: 'key.id.5',  },
      })`,
      errors: [
        '"id" property must be present, and have a value',
        '"id" property must not be empty',
        '"id" property must be a literal string',
        '"id" property must be a literal string',
        '"defaultMessage" property must be a string or a static template',
        '"defaultMessage" property must not be empty',
      ],
    },
    {
      code: `const defined = defineMessages({
        key1,
        key2: key2,
        key2: [],
        key3: 2,
        key4: 'message 3',
      })`,
      errors: [
        'only static messages are allowed in defineMessages',
        'only static messages are allowed in defineMessages',
        'only static messages are allowed in defineMessages',
        'only static messages are allowed in defineMessages',
        'only static messages are allowed in defineMessages',
      ],
    },
  ],
})
