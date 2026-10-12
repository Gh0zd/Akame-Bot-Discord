'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { requestedByRow } = require('../../utils/requestedBy');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('say'), 'commands.say.description').addStringOption((option) =>
    describe(option.setName('text').setRequired(true).setMaxLength(2000), 'commands.say.options.text'),
  ),
  cooldown: 3,
  botPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],

  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    await interaction.channel.send({
      content: text,
      components: [requestedByRow(interaction, 'say')], // deja claro quién envió el mensaje
      allowedMentions: { parse: [] }, // nunca hace ping desde /say
    });
    await interaction.reply({ content: interaction.t('commands.say.sent'), flags: MessageFlags.Ephemeral });
  },
};
