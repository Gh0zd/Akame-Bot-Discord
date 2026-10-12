'use strict';

const {
  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionFlagsBits, MessageFlags, AttachmentBuilder,
} = require('discord.js');
const { welcome } = require('../database/repositories');
const { cacheGuildInvites } = require('../utils/inviteTracker');
const { buildWelcomeCard, fillWelcomePlaceholders } = require('../utils/welcome');
const { welcomePanel } = require('../utils/welcomePanel');

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const MODALS = {
  text: [
    { field: 'cardType', label: 'welcome.modal.text.type', style: TextInputStyle.Short, max: 22 },
    { field: 'cardMessage', label: 'welcome.modal.text.cardMessage', style: TextInputStyle.Short, max: 30 },
    { field: 'message', label: 'welcome.modal.text.discordMessage', style: TextInputStyle.Paragraph, max: 1000 },
  ],
  appearance: [
    { field: 'url', label: 'welcome.modal.appearance.background', style: TextInputStyle.Paragraph, max: 500 },
    { field: 'nameColor', label: 'welcome.modal.appearance.nameColor', style: TextInputStyle.Short, max: 7 },
    { field: 'typeColor', label: 'welcome.modal.appearance.typeColor', style: TextInputStyle.Short, max: 7 },
    { field: 'messageColor', label: 'welcome.modal.appearance.messageColor', style: TextInputStyle.Short, max: 7 },
  ],
};

const ephemeral = (content) => ({ content, flags: MessageFlags.Ephemeral });
const canManage = (interaction) => interaction.inGuild() && interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild);
const DELETE_FIELDS = {
  message: 'message',
  cardMessage: 'cardMessage',
  cardType: 'cardType',
  nameColor: 'nameColor',
  typeColor: 'typeColor',
  messageColor: 'messageColor',
  color: 'color',
  channel: 'channelId',
  background: 'url',
};

function buildModal(kind, t, settings) {
  return new ModalBuilder()
    .setCustomId(`welcome:modal:${kind}`)
    .setTitle(t(`welcome.modal.${kind}.title`))
    .addComponents(
      ...MODALS[kind].map(({ field, label, style, max }) => {
        const input = new TextInputBuilder()
          .setCustomId(field)
          .setLabel(t(label))
          .setStyle(style)
          .setRequired(false)
          .setMaxLength(max)
          .setPlaceholder(t(`${label}Placeholder`));
        if (settings[field]) input.setValue(String(settings[field]).slice(0, max));
        return new ActionRowBuilder().addComponents(input);
      }),
    );
}

function readModalValues(interaction, kind) {
  return Object.fromEntries(
    MODALS[kind]
      .map(({ field }) => [field, interaction.fields.getTextInputValue(field).trim()])
      .filter(([, value]) => value),
  );
}

function validateValues(values, t) {
  if (values.url) {
    let url;
    try {
      url = new URL(values.url);
    } catch {
      return t('welcome.invalidImage');
    }
    if (!['http:', 'https:'].includes(url.protocol) || !/\.(png|jpe?g|webp)$/i.test(url.pathname)) return t('welcome.invalidImage');
  }
  for (const field of ['nameColor', 'typeColor', 'messageColor']) {
    if (values[field] && !HEX.test(values[field])) return t('welcome.invalidColor');
  }
  return null;
}

async function showUpdatedPanel(interaction, notice) {
  await interaction.update(welcomePanel(interaction, welcome.get(interaction.guildId) ?? {}));
  if (notice) await interaction.followUp(ephemeral(notice));
}

module.exports = [
  {
    kind: 'button',
    customId: /^welcome:(channel|text|appearance|message|background|color|preview|circle)$/,
    async execute(interaction) {
      if (!canManage(interaction)) return interaction.reply(ephemeral(interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' })));
      const kind = interaction.customId.split(':')[1];
      if (kind === 'preview') {
        const settings = welcome.get(interaction.guildId) ?? {};
        const member = { id: interaction.user.id, user: interaction.user, guild: interaction.guild };
        const template =
          settings.message || interaction.t('events.welcome.defaultMessage', { member: '[mention]', server: '[servername]' });
        const image = await buildWelcomeCard(member, settings, interaction.t);
        return interaction.reply({
          content: fillWelcomePlaceholders(template, { member, guild: interaction.guild }),
          files: [new AttachmentBuilder(image, { name: 'welcome-preview.png' })],
          flags: MessageFlags.Ephemeral,
          allowedMentions: { parse: [] },
        });
      }
      if (kind === 'circle') {
        const settings = welcome.get(interaction.guildId) ?? {};
        welcome.setField(interaction.guildId, 'circleBorder', !settings.circleBorder);
        return showUpdatedPanel(interaction, interaction.t(!settings.circleBorder ? 'welcome.circleEnabled' : 'welcome.circleDisabled'));
      }
      if (kind === 'channel') {
        const menu = new ChannelSelectMenuBuilder()
          .setCustomId('welcome:channelSelect')
          .addChannelTypes(ChannelType.GuildText)
          .setPlaceholder(interaction.t('welcome.channelPlaceholder'));
        return interaction.reply({ components: [new ActionRowBuilder().addComponents(menu)], flags: MessageFlags.Ephemeral });
      }

      const modalKind = ['message', 'text'].includes(kind) ? 'text' : kind === 'background' || kind === 'color' ? 'appearance' : kind;
      return interaction.showModal(buildModal(modalKind, interaction.t, welcome.get(interaction.guildId) ?? {}));
    },
  },
  {
    kind: 'select',
    customId: 'welcome:channelSelect',
    async execute(interaction) {
      if (!canManage(interaction)) return interaction.reply(ephemeral(interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' })));
      welcome.setField(interaction.guildId, 'channelId', interaction.values[0]);
      cacheGuildInvites(interaction.guild);
      await showUpdatedPanel(interaction, interaction.t('welcome.saved.channel', { channel: `<#${interaction.values[0]}>` }));
    },
  },
  {
    kind: 'select',
    customId: 'welcome:style',
    async execute(interaction) {
      if (!canManage(interaction)) return interaction.reply(ephemeral(interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' })));
      welcome.setField(interaction.guildId, 'style', interaction.values[0]);
      await showUpdatedPanel(interaction, interaction.t('welcome.saved.style'));
    },
  },
  {
    kind: 'modal',
    customId: /^welcome:modal:(text|appearance)$/,
    async execute(interaction) {
      if (!canManage(interaction)) return interaction.reply(ephemeral(interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' })));
      const kind = interaction.customId.split(':')[2];
      const values = readModalValues(interaction, kind);
      const error = validateValues(values, interaction.t);
      if (error) return interaction.reply(ephemeral(error));

      for (const [field, value] of Object.entries(values)) {
        welcome.setField(interaction.guildId, field, ['nameColor', 'typeColor', 'messageColor'].includes(field) ? value.replace(/^#/, '') : value);
      }
      await showUpdatedPanel(interaction, interaction.t('welcome.saved.updated'));
    },
  },
  {
    kind: 'select',
    customId: 'welcome:delete',
    async execute(interaction) {
      if (!canManage(interaction)) return interaction.reply(ephemeral(interaction.t('errors.userMissingPermissions', { permissions: '`Manage Server`' })));
      const field = DELETE_FIELDS[interaction.values[0]];
      if (!field) return interaction.reply(ephemeral(interaction.t('welcome.invalidSetting')));
      welcome.setField(interaction.guildId, field, null);
      await showUpdatedPanel(interaction, interaction.t(`welcome.deleted.${interaction.values[0]}`));
    },
  },
];
