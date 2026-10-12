'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');

async function replyOrDm(interaction, embed) {
  try {
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    if (error.code !== 50027) throw error;

    logger.warn('La interacción de /setavatar expiró; se enviará el resultado por mensaje directo.');
    try {
      await interaction.user.send({ embeds: [embed] });
    } catch (dmError) {
      logger.warn(`No se pudo enviar por DM el resultado de /setavatar: ${dmError.message}`);
    }
  }
}

module.exports = {
  data: describe(new SlashCommandBuilder().setName('setavatar'), 'commands.setavatar.description').addStringOption((o) =>
    describe(o.setName('link').setRequired(true), 'commands.setavatar.options.link'),
  ),
  developerOnly: true,

  async execute(interaction) {
    const t = interaction.t;
    const link = interaction.options.getString('link', true);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await interaction.client.user.setAvatar(link);
    } catch (error) {
      await replyOrDm(interaction, errorEmbed(t('commands.setavatar.failed', { error: error.message })));
      return;
    }
    await replyOrDm(interaction, successEmbed(t('commands.setavatar.done')));
  },
};
