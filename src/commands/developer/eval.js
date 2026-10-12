'use strict';

const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../../config');
const { describe } = require('../../utils/localize');

/** Ejecuta código arbitrario: solo se registra con ENABLE_EVAL=true y únicamente para los OWNER_IDS. */
module.exports = {
  enabled: config.enableEval,
  data: describe(new SlashCommandBuilder().setName('eval'), 'commands.eval.description'),
  developerOnly: true,

  async execute(interaction) {
    const input = new TextInputBuilder().setCustomId('code').setLabel('Code').setStyle(TextInputStyle.Paragraph).setRequired(true);
    await interaction.showModal(new ModalBuilder().setCustomId('eval_modal').setTitle('Eval').addComponents(new ActionRowBuilder().addComponents(input)));
  },
};
