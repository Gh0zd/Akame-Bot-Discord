'use strict';

const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const { describe } = require('../../utils/localize');
const { replyError } = require('../../utils/respond');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('screenshot'), 'commands.screenshot.description').addStringOption((o) =>
    describe(o.setName('url').setRequired(true), 'commands.screenshot.options.url'),
  ),
  developerOnly: true,
  cooldown: 5,
  botPermissions: ['AttachFiles'],

  async execute(interaction) {
    const raw = interaction.options.getString('url', true);
    let url;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      return replyError(interaction, interaction.t('commands.screenshot.invalid'));
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const { data } = await axios.get(`https://image.thum.io/get/width/1920/crop/675/noanimate/${url.href}`, { responseType: 'arraybuffer', timeout: 20_000 });
      await interaction.editReply({ files: [new AttachmentBuilder(Buffer.from(data), { name: 'screenshot.png' })] });
    } catch {
      await replyError(interaction, interaction.t('commands.screenshot.failed'));
    }
  },
};
