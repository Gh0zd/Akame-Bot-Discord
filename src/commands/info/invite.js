'use strict';

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('invite'), 'commands.invite.description'),
  cooldown: 5,
  allowDM: true,

  async execute(interaction) {
    const t = interaction.t;
    const embed = baseEmbed()
      .setTitle(t('commands.invite.title'))
      .setDescription(t('commands.invite.body', { url: config.links.invite }))
      .setThumbnail(interaction.client.user.displayAvatarURL());

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel(t('common.inviteMe')).setURL(config.links.invite).setStyle(ButtonStyle.Link),
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
