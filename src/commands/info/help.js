'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { helpPayload } = require('../../utils/helpMenu');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('help'), 'commands.help.description'),
  cooldown: 5,
  allowDM: true,
  execute: (interaction) => interaction.reply(helpPayload(interaction)),
};
