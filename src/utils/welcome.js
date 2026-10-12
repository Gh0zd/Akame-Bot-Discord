'use strict';

const { createCanvas } = require('@napi-rs/canvas');
const { Minimal, Panorama } = require('greetify');
const logger = require('./logger');

function createDefaultBackground() {
  const canvas = createCanvas(1280, 720);
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 1280, 720);
  gradient.addColorStop(0, '#15152F');
  gradient.addColorStop(1, '#492A68');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1280, 720);
  context.fillStyle = 'rgba(255, 255, 255, 0.05)';
  context.beginPath();
  context.arc(1040, 150, 300, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(180, 720, 260, 0, Math.PI * 2);
  context.fill();
  return `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`;
}

const DEFAULT_BACKGROUND = createDefaultBackground();
const DEFAULT_NAME_COLOR = '#00FF9E';
const DEFAULT_TEXT_COLOR = '#FFFFFF';
const cssColor = (color) => (color.startsWith('#') ? color : `#${color}`);

function fillWelcomePlaceholders(template, { member, guild, invite }) {
  const replacements = {
    '[accountcreated]': `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
    '[invitecount]': invite?.uses ?? 'N/A',
    '[invitername]': invite?.inviter?.username ?? 'N/A',
    '[inviter]': invite?.inviter ? `<@${invite.inviter.id}>` : 'N/A',
    '[username]': member.user.username,
    '[servername]': guild.name,
    '[tag]': member.user.username,
    '[mention]': `<@${member.id}>`,
    '[membercount]': guild.memberCount,
  };
  return Object.entries(replacements).reduce((text, [key, value]) => text.replaceAll(key, String(value)), template);
}

async function buildWelcomeCard(member, settings, t, invite) {
  const personalize = (text) =>
    member.guild ? fillWelcomePlaceholders(text, { member, guild: member.guild, invite }) : text;
  const cardOptions = {
    avatar: member.user.displayAvatarURL({ extension: 'png', size: 512 }),
    name: member.user.username,
    nameColor: cssColor(settings.nameColor || settings.color || DEFAULT_NAME_COLOR),
    type: personalize(settings.cardType || t('events.welcome.cardTitle')),
    typeColor: cssColor(settings.typeColor || DEFAULT_TEXT_COLOR),
    circleBorder: settings.circleBorder ?? false,
    backgroundImage: settings.url || DEFAULT_BACKGROUND,
  };

  const render = (options) =>
    settings.style === 'panorama'
      ? Panorama(options)
      : Minimal({
          ...options,
          message: personalize(settings.cardMessage || t('events.welcome.cardMessage')),
          messageColor: cssColor(settings.messageColor || DEFAULT_TEXT_COLOR),
        });

  try {
    return await render(cardOptions);
  } catch (error) {
    if (!settings.url) throw error;
    logger.warn(`No se pudo cargar el fondo de bienvenida configurado; se usará el fondo predeterminado: ${error.message}`);
    return render({ ...cardOptions, backgroundImage: DEFAULT_BACKGROUND });
  }
}

module.exports = { fillWelcomePlaceholders, buildWelcomeCard };
