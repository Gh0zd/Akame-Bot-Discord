'use strict';

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const { describe, rename } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: rename(describe(new SlashCommandBuilder().setName('support'), 'commands.support.description'), 'commands.support.name'),
  cooldown: 10,
  allowDM: true,

  async execute(interaction) {
    const t = interaction.t;
    const embed = baseEmbed()
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields({ name: t('commands.support.whatIs'), value: t('commands.support.whatIsBody') });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel(t('common.supportServer')).setStyle(ButtonStyle.Link).setURL(config.links.support),
    );
    await interaction.reply({ content: t('commands.support.body', { url: config.links.support }), embeds: [embed], components: [row] });
  },
};
