'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { premium } = require('../../database/repositories');
const { describe } = require('../../utils/localize');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { discordTime } = require('../../utils/format');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('redeem'), 'commands.redeem.description').addStringOption((o) =>
    describe(o.setName('code').setRequired(true).setMaxLength(32), 'commands.redeem.options.code'),
  ),
  cooldown: 10,

  async execute(interaction) {
    const t = interaction.t;
    const { user } = interaction;
    const result = premium.redeem(user.id, { id: user.id, username: user.username }, interaction.options.getString('code', true));

    const embeds = {
      already: errorEmbed(t('commands.redeem.already')),
      invalid: errorEmbed(t('commands.redeem.invalid')),
      ok: result.status === 'ok' && successEmbed(t('commands.redeem.success', { expires: discordTime(result.expiresAt, 'f') })),
    };
    await interaction.reply({ embeds: [embeds[result.status]], flags: MessageFlags.Ephemeral });
  },
};
