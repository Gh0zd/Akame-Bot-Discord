'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const translate = require('../src/utils/translate');

test('translate helper returns a translated text for a basic phrase', async () => {
  const result = await translate('hola', { to: 'en' });
  assert.ok(typeof result.text === 'string');
  assert.ok(result.text.length > 0);
  assert.match(result.text.toLowerCase(), /hello|hi|hey/);
});
