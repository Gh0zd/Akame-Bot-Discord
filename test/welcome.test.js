'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('../src/utils/i18n').loadLocales();

const { fillWelcomePlaceholders, buildWelcomeCard } = require('../src/utils/welcome');
const { meterBar } = require('../src/commands/fun/meter');
const { welcomePanel } = require('../src/utils/welcomePanel');
const { openDatabase, closeDatabase } = require('../src/database');
const welcome = require('../src/database/repositories/welcome');
const { createCanvas } = require('@napi-rs/canvas');

function testImage() {
  const canvas = createCanvas(32, 32);
  const context = canvas.getContext('2d');
  context.fillStyle = '#663399';
  context.fillRect(0, 0, 32, 32);
  return `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`;
}

test('welcome placeholders include member, server, invite and account details', () => {
  const member = {
    id: 'member-id',
    user: { id: 'member-id', username: 'Akame', createdTimestamp: 1_700_000_000_000 },
  };
  const guild = { name: 'Test Server', memberCount: 12 };
  const invite = { uses: 4, inviter: { id: 'inviter-id', username: 'Inviter' } };

  const result = fillWelcomePlaceholders(
    '[mention] [username] [tag] [servername] [membercount] [inviter] [invitername] [invitecount] [accountcreated]',
    { member, guild, invite },
  );

  assert.equal(result, '<@member-id> Akame Akame Test Server 12 <@inviter-id> Inviter 4 <t:1700000000:R>');
});

test('welcome card uses greetify v2 themes and configured styles', async () => {
  const image = testImage();
  const member = {
    id: 'member-id',
    user: {
      username: 'Akame',
      displayAvatarURL: () => image,
    },
    guild: { name: 'Test Server', memberCount: 12 },
  };
  const t = (key) => ({
    'events.welcome.cardTitle': 'Welcome',
    'events.welcome.cardMessage': 'Welcome, [username]!',
  })[key];

  const minimal = await buildWelcomeCard(member, {
    url: image,
    cardType: 'Hello [username]',
    cardMessage: 'Join [servername]!',
    nameColor: 'abcdef',
    typeColor: '123abc',
    messageColor: '123456',
    circleBorder: true,
  }, t);
  assert.equal(minimal.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

  const defaultMinimal = await buildWelcomeCard(member, {}, t);
  assert.equal(defaultMinimal.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

  const panorama = await buildWelcomeCard(member, { style: 'panorama', url: image }, t);
  assert.equal(panorama.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

  const defaultPanorama = await buildWelcomeCard(member, { style: 'panorama' }, t);
  assert.equal(defaultPanorama.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

  const fallback = await buildWelcomeCard(member, { style: 'panorama', url: 'http://127.0.0.1:1/unavailable.png' }, t);
  assert.equal(fallback.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('meter uses server-local bar emojis when available', () => {
  const emojis = [
    { name: 'Barra_verde', toString: () => '<:Barra_verde:123>' },
    { name: 'Barra_gris', toString: () => '<:Barra_gris:456>' },
  ];
  const guild = { emojis: { cache: { find: (predicate) => emojis.find(predicate) } } };

  assert.equal(meterBar(guild, 70), '<:Barra_verde:123>'.repeat(7) + '<:Barra_gris:456>'.repeat(4));
});

test('meter falls back to Unicode bars outside servers with local emojis', () => {
  assert.equal(meterBar(null, 70), '🟩'.repeat(7) + '⬜'.repeat(4));
});

test('welcome setup panel includes the preview button', () => {
  const panel = welcomePanel({
    t: (key) => key,
    user: { username: 'Admin', displayAvatarURL: () => 'https://example.com/avatar.png' },
    guild: null,
  });

  assert.ok(panel.components[0].components.some((button) => button.data.custom_id === 'welcome:preview'));
  assert.equal(panel.components[1].components[0].data.custom_id, 'welcome:style');
  assert.equal(panel.components[2].components[0].data.custom_id, 'welcome:delete');
  assert.doesNotThrow(() => panel.components.forEach((row) => row.toJSON()));
});

test('welcome settings migration preserves and extends guild configuration', () => {
  openDatabase(':memory:');
  try {
    welcome.setField('guild-id', 'channelId', 'channel-id');
    welcome.setField('guild-id', 'style', 'panorama');
    welcome.setField('guild-id', 'cardMessage', 'Welcome!');
    welcome.setField('guild-id', 'circleBorder', true);
    assert.deepEqual(welcome.get('guild-id'), {
      guildId: 'guild-id',
      url: null,
      color: null,
      message: null,
      channelId: 'channel-id',
      style: 'panorama',
      cardType: null,
      cardMessage: 'Welcome!',
      nameColor: null,
      typeColor: null,
      messageColor: null,
      circleBorder: true,
    });
  } finally {
    closeDatabase();
  }
});
