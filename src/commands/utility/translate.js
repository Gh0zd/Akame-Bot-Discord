'use strict';

const { SlashCommandBuilder } = require('discord.js');
const translate = require('../../utils/translate');
const { describe, rename } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');

const LANGUAGES = [
  { value: 'en', label: '[🇺🇸] English' },
  { value: 'es', label: '[🇪🇸] Español' },
  { value: 'pt', label: '[🇧🇷] Português' },
  { value: 'de', label: '[🇩🇪] Deutsch' },
  { value: 'fr', label: '[🇫🇷] Français' },
  { value: 'ru', label: '[🇷🇺] Русский' },
];

module.exports = {
  data: rename(describe(new SlashCommandBuilder().setName('translate'), 'commands.translate.description'), 'commands.translate.name')
    .addStringOption((option) => describe(option.setName('text').setRequired(true).setMaxLength(1000), 'commands.translate.options.text'))
    .addStringOption((option) =>
      describe(option.setName('language').setRequired(true), 'commands.translate.options.language').addChoices(
        ...LANGUAGES.map(({ value, label }) => ({ name: label, value })),
      ),
    ),
  cooldown: 3,

  async execute(interaction) {
    const t = interaction.t;
    await interaction.deferReply();

    const text = interaction.options.getString('text', true);
    const to = interaction.options.getString('language', true);

    let result;
    try {
      result = await translate(text, { to });
    } catch {
      return replyError(interaction, t('commands.translate.failed'));
    }

    const embed = baseEmbed()
      .addFields(
        { name: t('commands.translate.original'), value: `\`\`\`\n${text.slice(0, 1000)}\n\`\`\`` },
        { name: t('commands.translate.translated', { language: to.toUpperCase() }), value: `\`\`\`\n${result.text.slice(0, 1000)}\n\`\`\`` },
      )
      .setFooter({ text: t('commands.translate.footer') });
    await interaction.editReply({ embeds: [embed] });
  },
};
