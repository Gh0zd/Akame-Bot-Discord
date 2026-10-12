'use strict';

const os = require('node:os');
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { version: djsVersion } = require('discord.js');
const pkg = require('../../../package.json');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { formatUptime, progressBar } = require('../../utils/format');
const { paginate } = require('../../utils/paginate');

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

const modalInput = (id, label, style, maxLength, placeholder) =>
  new ActionRowBuilder().addComponents(
    new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(true).setMaxLength(maxLength).setPlaceholder(placeholder ?? ''),
  );

module.exports = {
  data: describe(new SlashCommandBuilder().setName('bot'), 'commands.bot.description')
    .addSubcommand((s) => describe(s.setName('info'), 'commands.bot.info'))
    .addSubcommand((s) => describe(s.setName('privacy'), 'commands.bot.privacy'))
    .addSubcommand((s) => describe(s.setName('bug'), 'commands.bot.bug'))
    .addSubcommand((s) => describe(s.setName('suggestion'), 'commands.bot.suggestion')),
  cooldown: 5,
  allowDM: true,

  async execute(interaction) {
    const handlers = { info, privacy, bug, suggestion };
    await handlers[interaction.options.getSubcommand()](interaction);
  },
};

async function info(interaction) {
  const { client, t } = interaction;
  const memory = process.memoryUsage();
  const memoryPercent = (memory.rss / os.totalmem()) * 100;
  const members = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);

  const embed = baseEmbed()
    .setTitle(`${client.user.username} v${pkg.version}`)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: t('commands.bot.servers'), value: `${client.guilds.cache.size}`, inline: true },
      { name: t('commands.bot.users'), value: `${members.toLocaleString()}`, inline: true },
      { name: t('commands.bot.uptime'), value: formatUptime(client.uptime), inline: true },
      { name: t('commands.bot.memory'), value: `${progressBar(Math.floor(memoryPercent / 10), 10, '▰', '▱')} ${memoryPercent.toFixed(1)}%\n${mb(memory.rss)} MB`, inline: true },
      { name: t('commands.bot.versions'), value: `Node ${process.version}\ndiscord.js ${djsVersion}`, inline: true },
      { name: t('commands.bot.system'), value: `${os.platform()} · ${os.cpus().length} cores`, inline: true },
    )
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
}

async function privacy(interaction) {
  const { t, client } = interaction;
  const sections = ['intro', 'legal', 'minors', 'usage', 'rights', 'changes'];
  const pages = sections.map((key) =>
    baseEmbed({ footer: false })
      .setTitle(t(`commands.bot.privacyPages.${key}.title`))
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(t(`commands.bot.privacyPages.${key}.body`)),
  );
  await paginate(interaction, pages);
}

const bug = (interaction) =>
  interaction.showModal(
    new ModalBuilder()
      .setCustomId('bug_report_modal')
      .setTitle(interaction.t('commands.bot.bugTitle'))
      .addComponents(
        modalInput('command', interaction.t('commands.bot.bugCommand'), TextInputStyle.Short, 100),
        modalInput('description', interaction.t('commands.bot.bugDescription'), TextInputStyle.Paragraph, 1000),
      ),
  );

const suggestion = (interaction) =>
  interaction.showModal(
    new ModalBuilder()
      .setCustomId('suggestion_modal')
      .setTitle(interaction.t('commands.bot.suggestionTitle'))
      .addComponents(modalInput('suggestion', interaction.t('commands.bot.suggestionLabel'), TextInputStyle.Paragraph, 1000, interaction.t('commands.bot.suggestionHint'))),
  );
