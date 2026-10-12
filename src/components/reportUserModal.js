'use strict';

const { MessageFlags } = require('discord.js');
const config = require('../config');
const { baseEmbed } = require('../utils/embeds');
const { sendToChannel } = require('../utils/channelLog');

module.exports = {
  kind: 'modal',
  customId: /^report_user:\d+$/,

  async execute(interaction) {
    const targetId = interaction.customId.split(':')[1];
    const target = await interaction.client.users.fetch(targetId).catch(() => null);
    const reason = interaction.fields.getTextInputValue('reason');

    const embed = baseEmbed({ footer: false })
      .setTitle('User Report')
      .setThumbnail(interaction.guild?.iconURL() ?? null)
      .addFields(
        { name: 'Reported', value: `${target?.username ?? 'unknown'} (\`${targetId}\`)` },
        { name: 'Reported by', value: `${interaction.user.username} (\`${interaction.user.id}\`)` },
        { name: 'Guild', value: `${interaction.guild?.name ?? '-'} (\`${interaction.guildId ?? '-'}\`)` },
        { name: 'Reason', value: reason },
      )
      .setTimestamp();
    await sendToChannel(interaction.client, config.channels.report, { embeds: [embed] });
    await interaction.reply({ content: interaction.t('common.submissionReceived'), flags: MessageFlags.Ephemeral });
  },
};
