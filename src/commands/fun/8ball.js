'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');
const { requestedByRow } = require('../../utils/requestedBy');
const { pick } = require('../../utils/format');

const REACTIONS = ['🎱', '👀', '😀', '😏', '🤔', '🔮', '✨', '😅', '🙃', '😎'];

module.exports = {
  data: describe(new SlashCommandBuilder().setName('8ball'), 'commands.8ball.description').addStringOption((option) =>
    describe(option.setName('question').setRequired(true).setMaxLength(500), 'commands.8ball.options.question'),
  ),
  cooldown: 3,

  async execute(interaction) {
    const t = interaction.t;
    const question = interaction.options.getString('question', true);
    if (hasForbiddenWords(question)) return replyError(interaction, t('errors.inappropriate'));

    const embed = baseEmbed({ footer: false })
      .setTitle(`${pick(REACTIONS)} 8Ball`)
      .addFields(
        { name: t('commands.8ball.question'), value: `\`\`\`\n${question}\n\`\`\`` },
        { name: t('commands.8ball.answer'), value: `\`\`\`\n${pick(t('commands.8ball.answers'))}\n\`\`\`` },
      );
    await interaction.reply({ embeds: [embed], components: [requestedByRow(interaction, '8ball')] });
  },
};
