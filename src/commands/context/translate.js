'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const translate = require('../../utils/translate');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');

const MAX_LENGTH = 1000;

module.exports = {
  data: new ContextMenuCommandBuilder().setName('Translate').setType(ApplicationCommandType.Message),
  cooldown: 5,
  async execute(interaction) {
    const t = interaction.t;
    const content = interaction.targetMessage.content?.trim();
    if (!content) return replyError(interaction, t('context.translate.empty'));
    if (content.length > MAX_LENGTH) return replyError(interaction, t('context.translate.tooLong', { max: MAX_LENGTH }));

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    // Traduce al idioma activo de quien usa el comando.
    const result = await translate(content, { to: interaction.lang }).catch(() => null);
    if (!result) return replyError(interaction, t('commands.translate.failed'));

    await interaction.editReply({ embeds: [baseEmbed().setDescription(result.text).setFooter({ text: t('commands.translate.footer') })] });
  },
};
