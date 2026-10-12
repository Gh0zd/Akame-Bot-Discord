'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const row = (id, label, style, extra = {}) => {
  const input = new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(true);
  if (extra.maxLength) input.setMaxLength(extra.maxLength);
  if (extra.value) input.setValue(extra.value);
  return new ActionRowBuilder().addComponents(input);
};

module.exports = {
  data: new ContextMenuCommandBuilder().setName('ReportUser').setType(ApplicationCommandType.User),
  cooldown: 5,
  async execute(interaction) {
    const t = interaction.t;
    const target = interaction.targetUser;
    const modal = new ModalBuilder()
      .setCustomId(`report_user:${target.id}`)
      .setTitle(t('context.report.title'))
      .addComponents(
        row('reason', t('context.report.reason'), TextInputStyle.Paragraph, { maxLength: 1000 }),
      );
    await interaction.showModal(modal);
  },
};
