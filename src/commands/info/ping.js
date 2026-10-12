'use strict';

const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { formatUptime } = require('../../utils/format');

const dot = (ms) => (ms <= 200 ? '🟢' : ms <= 400 ? '🟡' : '🔴');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('ping'), 'commands.ping.description'),
  cooldown: 10,
  allowDM: true,

  async execute(interaction) {
    const t = interaction.t;
    const sent = await interaction.reply({ content: '🏓', withResponse: true });
    const roundTrip = sent.resource.message.createdTimestamp - interaction.createdTimestamp;
    const api = Math.round(interaction.client.ws.ping);
    const worst = Math.max(roundTrip, api);

    const embed = baseEmbed()
      .setColor(worst < 200 ? config.colors.success : worst < 500 ? config.colors.warning : config.colors.error)
      .setTitle(t('commands.ping.title'))
      .setThumbnail('https://i.ibb.co/WWWH5BKW/router.webp')
      .addFields(
        { name: `📡 ${t('commands.ping.latency')}`, value: `>>> \`\`\`yml\n${dot(roundTrip)} ${roundTrip}ms\`\`\``, inline: true },
        { name: `🛰 ${t('commands.ping.api')}`, value: `>>> \`\`\`yml\n${dot(api)} ${api}ms\`\`\``, inline: true },
        { name: `⏲ ${t('commands.ping.uptime')}`, value: `>>> \`\`\`\n${formatUptime(interaction.client.uptime)}\`\`\``, inline: false },
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};
