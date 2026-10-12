'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { baseEmbed } = require('./embeds');
const { truncate } = require('./format');

function welcomePanel(interaction, settings = {}) {
  const t = interaction.t;
  const button = (id, key, style = ButtonStyle.Secondary) => new ButtonBuilder().setCustomId(id).setLabel(t(key)).setStyle(style);

  const buttons = new ActionRowBuilder().addComponents(
    button('welcome:channel', 'welcome.setupChannel', ButtonStyle.Success),
    button('welcome:text', 'welcome.setupMessage'),
    button('welcome:appearance', 'welcome.setupAppearance'),
    button('welcome:preview', 'welcome.previewButton', ButtonStyle.Primary),
    button('welcome:circle', settings.circleBorder ? 'welcome.circleOn' : 'welcome.circleOff'),
  );

  const style = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('welcome:style')
      .setPlaceholder(t('welcome.stylePlaceholder'))
      .addOptions(
        { label: t('welcome.styles.minimal'), value: 'minimal', default: (settings.style ?? 'minimal') === 'minimal' },
        { label: t('welcome.styles.panorama'), value: 'panorama', default: settings.style === 'panorama' },
      ),
  );

  const remove = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('welcome:delete')
      .setPlaceholder(t('welcome.deletePlaceholder'))
      .addOptions(['message', 'cardMessage', 'cardType', 'nameColor', 'typeColor', 'messageColor', 'color', 'channel', 'background'].map((key) => ({
        label: t(`welcome.delete.${key}`),
        value: key,
      }))),
  );

  const embed = baseEmbed({ footer: false })
    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
    .setTitle(t('welcome.panelTitle'))
    .setDescription(t('welcome.panelBody'))
    .addFields(
      { name: t('welcome.status.style'), value: t(`welcome.styles.${settings.style ?? 'minimal'}`), inline: true },
      { name: t('welcome.status.channel'), value: settings.channelId ? `<#${settings.channelId}>` : t('welcome.status.notSet'), inline: true },
      { name: t('welcome.status.background'), value: settings.url ? t('welcome.status.custom') : t('welcome.status.default'), inline: true },
      { name: t('welcome.status.avatar'), value: t(settings.circleBorder ? 'welcome.circleOn' : 'welcome.circleOff'), inline: true },
      { name: t('welcome.status.cardText'), value: settings.cardMessage || t('events.welcome.cardMessage'), inline: true },
      {
        name: t('welcome.status.discordMessage'),
        value: truncate(settings.message || t('events.welcome.defaultMessage', { member: '[mention]', server: '[servername]' }), 1000),
        inline: false,
      },
    )
    .setThumbnail(interaction.guild?.iconURL() ?? null)
    .setTimestamp();

  return { embeds: [embed], components: [buttons, style, remove] };
}

module.exports = { welcomePanel };
