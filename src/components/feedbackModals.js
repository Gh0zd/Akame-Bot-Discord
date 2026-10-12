'use strict';

const { MessageFlags } = require('discord.js');
const config = require('../config');
const { baseEmbed } = require('../utils/embeds');
const { sendToChannel } = require('../utils/channelLog');

const FORMS = {
  bug_report_modal: {
    channel: () => config.channels.bug,
    title: 'Bug report',
    fields: [['command', 'Command'], ['description', 'Description']],
  },
  suggestion_modal: {
    channel: () => config.channels.suggestion,
    title: 'Suggestion',
    fields: [['suggestion', 'Suggestion']],
  },
};

module.exports = {
  kind: 'modal',
  customId: /^(bug_report_modal|suggestion_modal)$/,

  async execute(interaction) {
    const form = FORMS[interaction.customId];
    const embed = baseEmbed({ footer: false })
      .setTitle(form.title)
      .setAuthor({ name: `${interaction.user.username} (${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL() })
      .addFields(form.fields.map(([id, name]) => ({ name, value: interaction.fields.getTextInputValue(id) })))
      .setFooter({ text: interaction.guild ? `${interaction.guild.name} (${interaction.guildId})` : 'DM' })
      .setTimestamp();

    await sendToChannel(interaction.client, form.channel(), { embeds: [embed] });
    await interaction.reply({ content: interaction.t('common.submissionReceived'), flags: MessageFlags.Ephemeral });
  },
};
