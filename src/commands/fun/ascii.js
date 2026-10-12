'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { promisify } = require('node:util');
const figlet = require('figlet');
const { describe } = require('../../utils/localize');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');

const figletText = promisify(figlet.text);
const MAX_LENGTH = 30;
const SUPPORTED = /^[a-zA-Z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;

module.exports = {
  data: describe(new SlashCommandBuilder().setName('ascii'), 'commands.ascii.description').addStringOption((option) =>
    describe(option.setName('text').setRequired(true).setMaxLength(MAX_LENGTH), 'commands.ascii.options.text'),
  ),
  cooldown: 3,

  async execute(interaction) {
    const t = interaction.t;
    const text = interaction.options.getString('text', true);
    if (hasForbiddenWords(text)) return replyError(interaction, t('errors.inappropriate'));
    if (!SUPPORTED.test(text)) return replyError(interaction, t('commands.ascii.unsupported'));

    const art = await figletText(text);
    await interaction.reply(`\`\`\`\n${art.slice(0, 1900)}\n\`\`\``);
  },
};
