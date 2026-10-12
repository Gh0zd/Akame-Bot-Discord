'use strict';

const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const cooldowns = require('../utils/cooldowns');
const { blacklist, premium } = require('../database/repositories');
const { baseEmbed } = require('../utils/embeds');
const { respond, replyError } = require('../utils/respond');
const { sendToChannel } = require('../utils/channelLog');
const { reportError } = require('./antiCrash');
const { missingPermissions, formatPermissions } = require('../utils/permissions');
const { discordTime } = require('../utils/format');
const logger = require('../utils/logger');

const IGNORED_DISCORD_ERRORS = new Set([10062, 40060]); // interacción desconocida / ya respondida
const DEFAULT_BOT_PERMISSIONS = [PermissionFlagsBits.EmbedLinks];

/**
 * Cada guard devuelve un mensaje de error (string) si el comando debe bloquearse, o null si todo está bien.
 * Se evalúan en orden; el primero que falle detiene la ejecución.
 */
const guards = [
  function blacklisted({ interaction, t }) {
    const entry = blacklist.get('user', interaction.user.id) ?? (interaction.guildId && blacklist.get('guild', interaction.guildId));
    if (!entry) return null;
    const key = entry.user_id ? 'errors.blacklistedUser' : 'errors.blacklistedGuild';
    return t(key, { reason: entry.reason, time: discordTime(entry.time) });
  },

  ({ command, t }) => (command.maintenance ? t('errors.maintenance', { command: command.data.name }) : null),

  ({ command, interaction, t }) =>
    (command.ownerOnly || command.developerOnly) && !config.ownerIds.includes(interaction.user.id)
      ? t('errors.ownerOnly', { command: command.data.name })
      : null,

  ({ command, interaction, t }) =>
    command.nsfw && !interaction.channel?.nsfw ? t('errors.nsfwOnly') : null,

  ({ command, interaction, t }) => {
    if (!command.premium) return null;
    const hasPremium = premium.isActive(interaction.user.id) || (interaction.guildId && premium.isActive(interaction.guildId));
    return hasPremium ? null : t('errors.premiumOnly', { support: config.links.support });
  },

  ({ command, interaction, t }) => {
    const missing = missingPermissions(interaction.memberPermissions ?? 0n, command.userPermissions);
    return missing.length ? t('errors.userMissingPermissions', { permissions: formatPermissions(interaction.lang, missing) }) : null;
  },

  ({ command, interaction, t }) => {
    if (!interaction.inGuild()) return null;
    const required = command.botPermissions ?? DEFAULT_BOT_PERMISSIONS;
    const missing = missingPermissions(interaction.appPermissions ?? 0n, required);
    return missing.length ? t('errors.botMissingPermissions', { permissions: formatPermissions(interaction.lang, missing) }) : null;
  },

  ({ command, interaction, t }) => {
    const remaining = cooldowns.check(command.data.name, interaction.user.id, command.cooldown);
    return remaining ? t('errors.cooldown', { seconds: remaining.toFixed(1), command: command.data.name }) : null;
  },
];

function runGuards(context) {
  for (const guard of guards) {
    const failure = guard(context);
    if (failure) return failure;
  }
  return null;
}

function logCommandUsage(client, interaction, command) {
  if (!config.commandLogs) return;
  const embed = baseEmbed({ footer: false })
    .setAuthor({ name: 'Command' })
    .setThumbnail(interaction.guild?.iconURL() ?? null)
    .addFields(
      { name: 'Author', value: `\`${interaction.user.username}\` (${interaction.user.id})` },
      { name: 'Command', value: `\`${command.data.name}\`` },
      { name: 'Guild', value: `${interaction.guild?.name ?? 'DM'} (${interaction.guildId ?? '-'}) · ${interaction.guild?.memberCount ?? 0} members` },
    )
    .setFooter({ text: `Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB` })
    .setTimestamp();
  sendToChannel(client, config.channels.command, { embeds: [embed] });
}

async function handleCommandError(client, interaction, command, error) {
  if (IGNORED_DISCORD_ERRORS.has(error?.code)) return;
  reportError(client, `Error en /${command.data.name}`, error);
  await replyError(interaction, interaction.t('errors.generic', { support: config.links.support })).catch((err) =>
    logger.warn(`No se pudo notificar el error al usuario: ${err.message}`),
  );
}

async function runCommand(client, interaction, command) {
  const failure = runGuards({ command, interaction, t: interaction.t });
  if (failure) return respond(interaction, { content: failure, ephemeral: true });

  try {
    await command.execute(interaction);
    logCommandUsage(client, interaction, command);
  } catch (error) {
    await handleCommandError(client, interaction, command, error);
  }
}

async function runAutocomplete(interaction, command) {
  try {
    await command?.autocomplete?.(interaction);
  } catch (error) {
    logger.warn(`Autocomplete /${interaction.commandName}: ${error.message}`);
  }
}

module.exports = { runCommand, runAutocomplete };
