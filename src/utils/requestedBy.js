'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/** Botón deshabilitado "Solicitado por: usuario" que acompaña a varias respuestas. */
const requestedByRow = (interaction, id = 'requested') =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${id}_by_${interaction.user.id}`)
      .setLabel(interaction.t('common.requestedBy', { user: interaction.user.username }))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );

module.exports = { requestedByRow };
