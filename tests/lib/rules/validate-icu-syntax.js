const test = require('../../../lib/test-utils')
const rule = require('../../../lib/rules/validate-icu-syntax')

const locale = { greeting: 'hello', hello: 'hello {name}' }

test(locale)(rule, {
  valid: [
    '(<SomeComponent id="something" defaultMessage="{" />)',
    'someFunctionCall({key: {id: "something", defaultMessage: "{"}})',
    '(<FormattedMessage id="greeting" defaultMessage="hello" />)',
    'formatMessage({id: "greeting", defaultMessage: "hello"})',
    'formatMessage({id: "greeting", defaultMessage: "hello {name}"})',
    'formatMessage({id: "greeting", defaultMessage: `hello {name}`})',
    '(<FormattedMessage id="hello" defaultMessage="hello {name}" values={{name}} />)',
    'defineMessages({key: {id: "greeting", defaultMessage: "hello"}})',
    'defineMessages({key: {id: "greeting", defaultMessage: "hello {name}"}})',
    'defineMessages({key: {id: "greeting", defaultMessage: `hello {name}`}})',

    'formatMessage()',

    '(<FormattedMessage id="hello" values={{name}} />)',
    '(<FormattedMessage id="hello" defaultMessage values={{name}} />)',
    '(<FormattedMessage id="hello" defaultMessage="" values={{name}} />)',

    'defineMessages()',
    'defineMessages({key: {id: "greeting"}})',
    'defineMessages({key: {id: "greeting", defaultMessage: ""}})',
    'defineMessages({key: {id: "greeting", defaultMessage: a && b}})',
  ],
  invalid: [
    {
      code: '(<FormattedMessage id="hello" defaultMessage="hello {" values={{name}} />)',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
    {
      code: '(<FormattedMessage id="hello" defaultMessage={"hello {"} values={{name}} />)',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
    {
      code: '(<FormattedMessage id="hello" defaultMessage={`hello {`} values={{name}} />)',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
    {
      code: 'formatMessage({id: "greeting", defaultMessage: "hello {"})',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },

    {
      code: 'formatMessage({id: "greeting", defaultMessage: `hello {`})',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
    {
      code: 'defineMessages({key: {id: "greeting", defaultMessage: "hello {"}})',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
    {
      code: 'defineMessages({key: {id: "greeting", defaultMessage: `hello {`}})',
      errors: ['defaultMessage should be a valid ICU MessageFormat string'],
    },
  ],
})
