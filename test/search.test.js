'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');

require('../src/utils/i18n').loadLocales();

let responseData;
let request;
const originalCreate = axios.create;
axios.create = () => ({
  get: async (...args) => {
    request = args;
    return { data: responseData };
  },
});
const command = require('../src/commands/search/search');
axios.create = originalCreate;

const createInteraction = (subcommand, query) => ({
  lang: 'es',
  t: (key) => key,
  options: {
    getSubcommand: () => subcommand,
    getString: () => query,
  },
  deferReply: async function deferReply() {
    this.deferred = true;
  },
  editReply: async function editReply(reply) {
    this.reply = reply;
    return reply;
  },
});

test('lyrics search uses LRCLIB with the full query', async () => {
  responseData = [{
    name: 'Coldplay - Yellow',
    artistName: 'Coldplay',
    trackName: 'Yellow',
    plainLyrics: 'Look at the stars',
  }];
  const interaction = createInteraction('lyrics', 'Coldplay - Yellow');

  await command.execute(interaction);

  assert.equal(request[0], 'https://lrclib.net/api/search');
  assert.deepEqual(request[1].params, { q: 'Coldplay - Yellow' });
  const embed = interaction.reply.embeds[0].toJSON();
  assert.equal(embed.title, 'Coldplay - Yellow');
  assert.equal(embed.description, 'Look at the stars');
});

test('anime search URL-encodes its query through API parameters', async () => {
  responseData = {
    data: [{
      attributes: {
        titles: { en_us: 'Cowboy Bebop', ja_jp: 'カウボーイビバップ' },
        synopsis: 'A crew of bounty hunters.',
        posterImage: { original: 'https://example.com/poster.jpg' },
        startDate: '1998-04-03',
        status: 'finished',
        averageRating: '86.4',
        episodeCount: 26,
        showType: 'TV',
      },
    }],
  };
  const interaction = createInteraction('anime', 'Cowboy Bebop');

  await command.execute(interaction);

  assert.equal(request[0], 'https://kitsu.io/api/edge/anime');
  assert.deepEqual(request[1].params, { 'filter[text]': 'Cowboy Bebop', 'page[limit]': 1 });
  assert.equal(interaction.reply.embeds[0].toJSON().title, 'Cowboy Bebop');
});

test('Wikipedia search returns the summary and canonical page URL', async () => {
  responseData = {
    query: {
      pages: [{
        title: 'One Piece',
        extract: 'A Japanese manga series.',
      }],
    },
  };
  const interaction = createInteraction('wikipedia', 'manga de piratas');

  await command.execute(interaction);

  assert.equal(request[0], 'https://es.wikipedia.org/w/api.php');
  assert.equal(request[1].params.gsrsearch, 'manga de piratas');
  assert.equal(request[1].params.generator, 'search');
  assert.match(request[1].headers['User-Agent'], /^AkameBotDiscord\//);
  const embed = interaction.reply.embeds[0].toJSON();
  assert.equal(embed.title, '🌐 One Piece');
  assert.equal(embed.url, 'https://es.wikipedia.org/wiki/One_Piece');
  assert.equal(embed.description, 'A Japanese manga series.');
});

test('Wikipedia search reports when no page matches', async () => {
  responseData = { batchcomplete: true, query: { pages: [] } };
  const interaction = createInteraction('wikipedia', 'a topic with no result');

  await command.execute(interaction);

  assert.equal(interaction.reply.embeds[0].toJSON().description, '❌ search.notFound');
});
