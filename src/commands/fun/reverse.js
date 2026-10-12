'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('reverse'), 'commands.reverse.description').addStringOption((option) =>
    describe(option.setName('text').setRequired(true).setMaxLength(1900), 'commands.reverse.options.text'),
  ),
  cooldown: 3,

  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    if (hasForbiddenWords(text)) return replyError(interaction, interaction.t('errors.inappropriate'));
    await interaction.reply({ content: [...text].reverse().join(''), allowedMentions: { parse: [] } });
  },
};
