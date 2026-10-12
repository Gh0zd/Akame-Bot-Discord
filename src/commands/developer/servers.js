'use strict';

const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('servers'), 'commands.servers.description')
    .addSubcommand((s) => describe(s.setName('top'), 'commands.servers.top'))
    .addSubcommand((s) => describe(s.setName('list'), 'commands.servers.list')),
  developerOnly: true,

  async execute(interaction) {
    const guilds = [...interaction.client.guilds.cache.values()];

    if (interaction.options.getSubcommand() === 'top') {
      const top = guilds.sort((a, b) => b.memberCount - a.memberCount).slice(0, 20);
      const description = top.map((guild, i) => `${i + 1}) ${guild.name} → ${guild.memberCount} members`).join('\n');
      return interaction.reply({ embeds: [baseEmbed({ footer: false }).setTitle('Top guilds').setDescription(description || '—')], flags: MessageFlags.Ephemeral });
    }

    const text = guilds.map((g) => `${g.name} (${g.id}) | ${g.memberCount} members | owner: ${g.ownerId}`).join('\n');
    await interaction.reply({ files: [new AttachmentBuilder(Buffer.from(text), { name: 'servers.txt' })], flags: MessageFlags.Ephemeral });
  },
};
