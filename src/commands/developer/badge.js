'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { badges } = require('../../database/repositories');
const { describe } = require('../../utils/localize');
const { BADGE_NAMES } = require('../../utils/userProfile');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('badge'), 'commands.badge.description')
    .addUserOption((o) => describe(o.setName('user').setRequired(true), 'commands.options.target'))
    .addStringOption((o) =>
      describe(o.setName('badge').setRequired(true), 'commands.badge.options.badge').addChoices(...BADGE_NAMES.map((name) => ({ name, value: name }))),
    )
    .addBooleanOption((o) => describe(o.setName('enabled').setRequired(true), 'commands.badge.options.enabled')),
  developerOnly: true,

  async execute(interaction) {
    const t = interaction.t;
    const user = interaction.options.getUser('user', true);
    const badge = interaction.options.getString('badge', true);
    const enabled = interaction.options.getBoolean('enabled', true);

    const changed = badges.toggle(user.id, badge, enabled);
    const embed = changed
      ? successEmbed(t(enabled ? 'commands.badge.added' : 'commands.badge.removed', { badge, user: user.username }))
      : errorEmbed(t('commands.badge.nothing'));
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
