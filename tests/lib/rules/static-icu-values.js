const test = require('../../../lib/test-utils')
const rule = require('../../../lib/rules/static-icu-values')

const locale = { greeting: 'hello', hello: 'hello {name}' }

test(locale)(rule, {
  valid: [
    '(<SomeComponent id="something" defaultMessage="{" />)',
    'someFunctionCall({key: {id: "something", defaultMessage: "{"}})',
    '(<FormattedMessage id="greeting" defaultMessage="hello" />)',
    'formatMessage({id: "greeting", defaultMessage: "hello"})',
    'formatMessage({id: "greeting", defaultMessage: "hello {name}"}, {name})',
    'formatMessage({id: "greeting", defaultMessage: `hello {name}`}, {name})',
    '(<FormattedMessage id="hello" defaultMessage="hello {name}" values={{ "name": name }} />)',
    '(<FormattedMessage id="hello" defaultMessage={`hello {name}`} values={{name}} />)',
    'defineMessages({key: {id: "greeting", defaultMessage: "hello"}})',
    'defineMessages({key: {id: "greeting", defaultMessage: "hello {name}"}})',
    'defineMessages({key: {id: "greeting", defaultMessage: `hello {name}`}})',
  ],
  invalid: [
    {
      code: '(<FormattedMessage id="hello" defaultMessage="hello {name}" />)',
      errors: [/"name"/],
    },
    {
      code:
        '(<FormattedMessage id="hello" defaultMessage="hello {name}" values={{}} />)',
      errors: [/"name"/],
    },
    {
      code:
        '(<FormattedMessage id="hello" defaultMessage={`hello {nome}`} values={{name}} />)',
      errors: [/"nome"/],
    },
    {
      code:
        'formatMessage({id: "greeting", defaultMessage: "hello {name}"}, {})',
      errors: [/"name"/],
    },
    {
      code:
        'formatMessage({id: "greeting", defaultMessage: `hello {nome}`}, {name})',
      errors: [/"nome"/],
    },
    {
      code:
        'formatMessage({id: "plural", defaultMessage: "{count, plural, =0 {some {variable}} other {# objects}}"})',
      errors: [/"count", "variable"/],
    },
    {
      code:
        'defineMessages({key: {id: "greeting", defaultMessage: "hello {"}})',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
  ],
})
