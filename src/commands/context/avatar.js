'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { avatarPayload } = require('../../utils/userProfile');

module.exports = {
  data: new ContextMenuCommandBuilder().setName('Avatar').setType(ApplicationCommandType.User),
  cooldown: 5,
  execute: (interaction) => interaction.reply(avatarPayload(interaction, interaction.targetUser)),
};
