'use strict';

const { MessageFlags } = require('discord.js');
const { errorEmbed } = require('./embeds');

/**
 * Responde a una interacción sin importar si ya se respondió o se difirió.
 * Con `ephemeral: true` el mensaje solo lo ve quien ejecutó el comando.
 */
async function respond(interaction, { ephemeral = false, ...payload }) {
  if (interaction.deferred || interaction.replied) {
    return interaction.followUp({ ...payload, ...(ephemeral && { flags: MessageFlags.Ephemeral }) });
  }
  return interaction.reply({ ...payload, ...(ephemeral && { flags: MessageFlags.Ephemeral }) });
}

/** Respuesta de error efímera (usa `editReply` si la interacción venía diferida sin flag efímera). */
async function replyError(interaction, description) {
  const payload = { embeds: [errorEmbed(description)], flags: MessageFlags.Ephemeral };
  if (interaction.deferred && !interaction.replied) {
    return interaction.editReply({ embeds: payload.embeds, content: null, components: [], files: [] });
  }
  return respond(interaction, { embeds: payload.embeds, ephemeral: true });
}

module.exports = { respond, replyError };
