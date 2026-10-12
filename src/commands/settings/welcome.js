'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { features, welcome } = require('../../database/repositories');
const { successEmbed } = require('../../utils/embeds');
const { welcomePanel } = require('../../utils/welcomePanel');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('welcome'), 'commands.welcome.description')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => describe(s.setName('setup'), 'commands.welcome.setup'))
    .addSubcommand((s) =>
      describe(s.setName('ping-join'), 'commands.welcome.pingJoin')
        .addBooleanOption((o) => describe(o.setName('enabled').setRequired(true), 'commands.welcome.options.enabled'))
        .addChannelOption((o) => describe(o.setName('channel').addChannelTypes(ChannelType.GuildText), 'commands.welcome.options.channel'))
        .addStringOption((o) => describe(o.setName('message').setMaxLength(500), 'commands.welcome.options.message')),
    ),
  cooldown: 5,
  userPermissions: [PermissionFlagsBits.ManageGuild],

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'setup') {
      return interaction.reply({ ...welcomePanel(interaction, welcome.get(interaction.guildId) ?? {}), flags: MessageFlags.Ephemeral });
    }

    const enabled = interaction.options.getBoolean('enabled', true);
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    features.setFeature(interaction.guildId, 'pingJoin', enabled);
    if (channel || message) {
      const current = features.getPingOnJoin(interaction.guildId);
      features.setPingOnJoin(interaction.guildId, {
        roleId: current?.roleId ?? null,
        channelIds: channel ? [channel.id] : current?.channelIds ?? [],
        message: message ?? current?.message ?? null,
      });
    }
    await interaction.reply({
      embeds: [successEmbed(interaction.t(enabled ? 'commands.welcome.pingJoinOn' : 'commands.welcome.pingJoinOff'))],
      flags: MessageFlags.Ephemeral,
    });
  },
};
