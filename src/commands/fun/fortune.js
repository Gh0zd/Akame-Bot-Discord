'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe, rename } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { requestedByRow } = require('../../utils/requestedBy');
const { pick, randomInt } = require('../../utils/format');

module.exports = {
  data: rename(describe(new SlashCommandBuilder().setName('fortune'), 'commands.fortune.description'), 'commands.fortune.name'),
  cooldown: 5,

  async execute(interaction) {
    const t = interaction.t;
    const stat = () => randomInt(0, 99);
    const embed = baseEmbed({ footer: false })
      .setThumbnail('https://i.ibb.co/whXwhJks/Fortune.webp')
      .setTimestamp()
      .addFields(
        { name: t('commands.fortune.says'), value: `\`\`\`\n${pick(t('commands.fortune.messages'))}\n\`\`\``, inline: true },
        {
          name: t('commands.fortune.forecast'),
          value: [
            `❤️ **${t('commands.fortune.love')}:** ${stat()}%`,
            `💉 **${t('commands.fortune.health')}:** ${stat()}%`,
            `💸 **${t('commands.fortune.money')}:** ${stat()}%`,
            `🍀 **${t('commands.fortune.luck')}:** ${stat()}%`,
            `🎉 **${t('commands.fortune.prosperity')}:** ${stat()}%`,
          ].join('\n'),
          inline: true,
        },
      );
    await interaction.reply({ embeds: [embed], components: [requestedByRow(interaction, 'fortune')] });
  },
};
