const test = require('../../../lib/test-utils')
const rule = require('../../../lib/rules/static-jsx')

const locale = { greeting: 'hello', hello: 'hello {name}' }

test(locale)(rule, {
  valid: [
    '(<SomeComponent />)',
    '(<FormattedMessage id="greeting" defaultMessage="hello" />)',
    '(<FormattedMessage id="hello" defaultMessage="hello {name}" values={{name}} />)',
  ],
  invalid: [
    {
      code: '(<FormattedMessage />)',
      errors: [
        '"id" attribute must be present',
        '"defaultMessage" attribute must be present',
      ],
    },
    {
      code: '(<FormattedMessage id="" defaultMessage="" />)',
      errors: [
        '"id" attribute must not be empty',
        '"defaultMessage" attribute must not be empty',
      ],
    },
    {
      code: '(<FormattedMessage id="greeting" />)',
      output: '(<FormattedMessage id="greeting" defaultMessage="hello" />)',
      errors: ['"defaultMessage" attribute must be present'],
    },
    {
      code: '(<FormattedMessage id={1} defaultMessage={2}/>)',
      errors: [
        '"id" attribute must be a static string',
        '"defaultMessage" attribute must be a static string',
      ],
    },
    {
      code: '(<FormattedMessage id="h" defaultMessage={`hello ${h}`} />)',
      errors: ['"defaultMessage" attribute must be a static string'],
    },
    {
      code: '(<FormattedMessage id={props.id} defaultMessage={props.id} />)',
      errors: [
        '"id" attribute must be a static string',
        '"defaultMessage" attribute must be a static string',
      ],
    },
    {
      code: "(<FormattedMessage id={'greeting'} defaultMessage={`hello`} />)",
      output: '(<FormattedMessage id="greeting" defaultMessage="hello" />)',
      errors: [
        '"id" attribute must be a static string',
        'Curly braces are unnecessary here.',
        'Curly braces are unnecessary here.',
      ],
    },
    {
      code: '(<FormattedMessage id="hello" values={{}} {...props} />)',
      output:
        '(<FormattedMessage id="hello" defaultMessage="hello {name}" values={{}} {...props} />)',
      errors: [
        '"defaultMessage" attribute must be present',
        'empty objects are not accepted as values, remove it',
        'spreads are not allowed in FormattedMessage',
      ],
    },
    {
      code: '(<FormattedMessage id="h" defaultMessage="h" values={{...p}} />)',
      errors: ['spreads are not allowed in "values"'],
    },
    {
      code:
        '(<FormattedMessage id="h" defaultMessage="h" values={{[a]: 1}} />)',
      errors: ['computed properties are not allowed in "values"'],
    },
    {
      code: '(<FormattedMessage id="h" defaultMessage="h" values={props} />)',
      errors: ['"values" attribute must be have an static object as value'],
    },
  ],
})
