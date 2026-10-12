'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { userInfoEmbed } = require('../../utils/userProfile');

module.exports = {
  data: new ContextMenuCommandBuilder().setName('UserInfo').setType(ApplicationCommandType.User),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    const member = await interaction.guild.members.fetch(interaction.targetId).catch(() => null);
    await interaction.editReply({ embeds: [await userInfoEmbed(interaction, interaction.targetUser, member)] });
  },
};
