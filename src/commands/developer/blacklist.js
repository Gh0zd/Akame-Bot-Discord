'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { blacklist } = require('../../database/repositories');
const { getDatabase } = require('../../database');
const { describe } = require('../../utils/localize');
const { baseEmbed, errorEmbed, successEmbed } = require('../../utils/embeds');
const { discordTime } = require('../../utils/format');

const SNOWFLAKE = /^\d{17,20}$/;
const TARGETS = ['user', 'server'];
const kindOf = (target) => (target === 'server' ? 'guild' : 'user');

const idOption = (o) => describe(o.setName('id').setRequired(true), 'commands.blacklist.options.id');
const targetOption = (o) =>
  describe(o.setName('target').setRequired(true), 'commands.blacklist.options.target').addChoices(...TARGETS.map((name) => ({ name, value: name })));

module.exports = {
  data: describe(new SlashCommandBuilder().setName('blacklist'), 'commands.blacklist.description')
    .addSubcommand((s) =>
      describe(s.setName('add'), 'commands.blacklist.add')
        .addStringOption(targetOption)
        .addStringOption(idOption)
        .addStringOption((o) => describe(o.setName('reason').setRequired(true).setMaxLength(300), 'commands.blacklist.options.reason')),
    )
    .addSubcommand((s) => describe(s.setName('remove'), 'commands.blacklist.remove').addStringOption(targetOption).addStringOption(idOption))
    .addSubcommand((s) => describe(s.setName('list'), 'commands.blacklist.list')),
  developerOnly: true,

  async execute(interaction) {
    const t = interaction.t;
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') return list(interaction);

    const target = interaction.options.getString('target', true);
    const id = interaction.options.getString('id', true);
    if (!SNOWFLAKE.test(id)) return interaction.reply({ embeds: [errorEmbed(t('commands.blacklist.invalidId'))], flags: MessageFlags.Ephemeral });

    if (sub === 'add') {
      blacklist.add(kindOf(target), id, interaction.options.getString('reason', true));
      return interaction.reply({ embeds: [successEmbed(t('commands.blacklist.added', { target, id }))], flags: MessageFlags.Ephemeral });
    }

    const removed = blacklist.remove(kindOf(target), id);
    const embed = removed ? successEmbed(t('commands.blacklist.removed', { target, id })) : errorEmbed(t('commands.blacklist.notFound', { target, id }));
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

async function list(interaction) {
  const db = getDatabase();
  const users = db.prepare('SELECT user_id AS id, reason, time FROM user_blacklist ORDER BY time DESC LIMIT 15').all();
  const guilds = db.prepare('SELECT guild_id AS id, reason, time FROM guild_blacklist ORDER BY time DESC LIMIT 15').all();
  const fmt = (rows) => rows.map((r) => `\`${r.id}\` — ${r.reason} (${discordTime(r.time)})`).join('\n') || '—';

  await interaction.reply({
    embeds: [baseEmbed({ footer: false }).addFields({ name: 'Users', value: fmt(users) }, { name: 'Servers', value: fmt(guilds) })],
    flags: MessageFlags.Ephemeral,
  });
}
