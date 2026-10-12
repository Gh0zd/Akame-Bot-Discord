'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');

const MAX_LENGTH = 40;
const toRegional = (text) =>
  [...text].map((char) => (/^[a-z]$/i.test(char) ? `:regional_indicator_${char.toLowerCase()}:` : char)).join(' ');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('bigtext'), 'commands.bigtext.description').addStringOption((option) =>
    describe(option.setName('text').setRequired(true).setMaxLength(MAX_LENGTH), 'commands.bigtext.options.text'),
  ),
  cooldown: 3,

  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    if (hasForbiddenWords(text)) return replyError(interaction, interaction.t('errors.inappropriate'));
    await interaction.reply({ content: toRegional(text).slice(0, 2000), allowedMentions: { parse: [] } });
  },
};
