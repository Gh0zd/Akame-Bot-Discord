'use strict';

const { Events } = require('discord.js');
const { logGuildChange } = require('../../utils/guildLog');

module.exports = {
  name: Events.GuildDelete,
  execute: (client, guild) => logGuildChange(client, guild, false),
};
