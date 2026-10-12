'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../../config');
const { settings } = require('../../database/repositories');
const { describe } = require('../../utils/localize');
const { createTranslator } = require('../../utils/i18n');
const { successEmbed } = require('../../utils/embeds');

const LANGUAGE_NAMES = { en: '🇺🇸 English', es: '🇪🇸 Español', pt: '🇧🇷 Português' };
const choices = config.supportedLanguages.map((value) => ({ name: LANGUAGE_NAMES[value] ?? value, value }));

const languageOption = (option) =>
  describe(option.setName('language').setRequired(true), 'commands.language.options.language').addChoices(...choices);

module.exports = {
  data: describe(new SlashCommandBuilder().setName('language'), 'commands.language.description')
    .addSubcommand((sub) =>
      describe(sub.setName('server'), 'commands.language.server').addStringOption(languageOption),
    )
    .addSubcommand((sub) => describe(sub.setName('me'), 'commands.language.me').addStringOption(languageOption))
    .addSubcommand((sub) => describe(sub.setName('reset'), 'commands.language.reset').addStringOption((option) =>
      describe(option.setName('scope').setRequired(true), 'commands.language.options.scope').addChoices(
        { name: 'server', value: 'server' },
        { name: 'me', value: 'me' },
      ),
    ))
    .addSubcommand((sub) => describe(sub.setName('view'), 'commands.language.view')),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const handlers = { server: setServer, me: setMe, reset, view };
    await handlers[sub](interaction);
  },
};

async function setServer(interaction) {
  const language = interaction.options.getString('language', true);
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' }),
      flags: MessageFlags.Ephemeral,
    });
  }
  settings.setGuildLanguage(interaction.guildId, language);
  const t = createTranslator(language); // confirma ya en el idioma elegido
  await interaction.reply({ embeds: [successEmbed(t('commands.language.serverSet', { language: LANGUAGE_NAMES[language] }))] });
}

async function setMe(interaction) {
  const language = interaction.options.getString('language', true);
  settings.setUserLanguage(interaction.user.id, language);
  const t = createTranslator(language);
  await interaction.reply({
    embeds: [successEmbed(t('commands.language.userSet', { language: LANGUAGE_NAMES[language] }))],
    flags: MessageFlags.Ephemeral,
  });
}

async function reset(interaction) {
  const scope = interaction.options.getString('scope', true);
  if (scope === 'server') {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' }),
        flags: MessageFlags.Ephemeral,
      });
    }
    settings.clearGuildLanguage(interaction.guildId);
  } else {
    settings.clearUserLanguage(interaction.user.id);
  }
  await interaction.reply({
    embeds: [successEmbed(interaction.t('commands.language.resetDone', { default: LANGUAGE_NAMES[config.defaultLanguage] }))],
    flags: MessageFlags.Ephemeral,
  });
}

async function view(interaction) {
  const t = interaction.t;
  const guildLang = settings.getGuildLanguage(interaction.guildId);
  const userLang = settings.getUserLanguage(interaction.user.id);
  const name = (lang) => (lang ? LANGUAGE_NAMES[lang] : t('commands.language.notSet'));

  await interaction.reply({
    content: t('commands.language.current', {
      server: name(guildLang),
      user: name(userLang),
      active: LANGUAGE_NAMES[interaction.lang],
      default: LANGUAGE_NAMES[config.defaultLanguage],
    }),
    flags: MessageFlags.Ephemeral,
  });
}
