'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { bannerPayload } = require('../../utils/userProfile');
const { replyError } = require('../../utils/respond');

module.exports = {
  data: new ContextMenuCommandBuilder().setName('Banner').setType(ApplicationCommandType.User),
  cooldown: 5,
  async execute(interaction) {
    const payload = await bannerPayload(interaction, interaction.targetUser);
    return payload ? interaction.reply(payload) : replyError(interaction, interaction.t('userinfo.noBanner'));
  },
};
