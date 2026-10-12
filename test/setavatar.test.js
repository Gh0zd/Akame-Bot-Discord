'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('../src/utils/i18n').loadLocales();
const command = require('../src/commands/developer/setavatar');

test('setavatar sends the result by DM when its interaction token has expired', async () => {
  const directMessages = [];
  let updatedAvatar;
  const interaction = {
    t: (key) => key === 'commands.setavatar.done' ? 'Avatar actualizado.' : key,
    options: { getString: () => 'https://example.com/avatar.png' },
    client: { user: { setAvatar: async (link) => { updatedAvatar = link; } } },
    user: { send: async (message) => directMessages.push(message) },
    deferReply: async () => {},
    editReply: async () => {
      const error = new Error('Invalid Webhook Token');
      error.code = 50027;
      throw error;
    },
  };

  await command.execute(interaction);

  assert.equal(updatedAvatar, 'https://example.com/avatar.png');
  assert.equal(directMessages.length, 1);
  assert.equal(directMessages[0].embeds[0].toJSON().description, '✅ Avatar actualizado.');
});
