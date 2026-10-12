'use strict';

const { Events, AttachmentBuilder } = require('discord.js');
const { welcome, features } = require('../../database/repositories');
const { resolveLanguage, createTranslator } = require('../../utils/i18n');
const { findUsedInvite } = require('../../utils/inviteTracker');
const { fillWelcomePlaceholders, buildWelcomeCard } = require('../../utils/welcome');
const logger = require('../../utils/logger');

const PING_DELETE_DELAY_MS = 1000;

async function sendWelcome(member, t) {
  const settings = welcome.get(member.guild.id);
  if (!settings?.channelId) return;

  const channel = await member.guild.channels.fetch(settings.channelId);
  if (!channel?.isTextBased()) throw new Error(`El canal de bienvenida ${settings.channelId} no está disponible.`);

  const invite = await findUsedInvite(member.guild);
  const attachment = new AttachmentBuilder(await buildWelcomeCard(member, settings, t, invite), { name: 'welcome-card.png' });
  const template = settings.message || t('events.welcome.defaultMessage', { member: '[mention]', server: '[servername]' });

  await channel.send({
    content: fillWelcomePlaceholders(template, { member, guild: member.guild, invite }),
    files: [attachment],
    allowedMentions: { parse: [], users: [member.id] },
  });
}

/** "Ping al entrar": menciona al nuevo miembro en los canales configurados y borra el mensaje enseguida. */
async function sendPingOnJoin(member, t) {
  if (!features.getFeatures(member.guild.id).pingJoin) return;

  const pingConfig = features.getPingOnJoin(member.guild.id);
  const channels = [];
  if (pingConfig?.channelIds?.length) {
    for (const id of pingConfig.channelIds) {
      try {
        const channel = await member.guild.channels.fetch(id);
        if (channel) channels.push(channel);
      } catch (error) {
        logger.warn(`guildMemberAdd (${member.guild.id}): no se pudo obtener el canal de ping-join ${id}: ${error.message}`);
      }
    }
  } else if (member.guild.systemChannel) {
    channels.push(member.guild.systemChannel);
  }

  const content = pingConfig?.message
    ? fillWelcomePlaceholders(pingConfig.message, { member, guild: member.guild })
    : t('events.pingJoin', { member: member.toString(), server: member.guild.name });

  if (!channels.length) {
    logger.warn(`guildMemberAdd (${member.guild.id}): no hay un canal configurado para ping-join.`);
    return;
  }

  for (const channel of channels) {
    if (!channel?.isTextBased()) {
      logger.warn(`guildMemberAdd (${member.guild.id}): el canal configurado para ping-join no es de texto.`);
      continue;
    }
    try {
      const message = await channel.send({ content, allowedMentions: { parse: [], users: [member.id] } });
      setTimeout(() => message.delete().catch((error) => logger.warn(`No se pudo borrar el ping de entrada: ${error.message}`)), PING_DELETE_DELAY_MS);
    } catch (error) {
      logger.warn(`guildMemberAdd (${member.guild.id}): no se pudo enviar ping-join: ${error.message}`);
    }
  }
}

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(_client, member) {
    if (member.user.bot) return;
    const t = createTranslator(resolveLanguage({ guildId: member.guild.id }));

    // Cada tarea falla de forma independiente.
    const results = await Promise.allSettled([sendWelcome(member, t), sendPingOnJoin(member, t)]);
    for (const result of results) {
      if (result.status === 'rejected') logger.warn(`guildMemberAdd (${member.guild.id}): ${result.reason?.message ?? result.reason}`);
    }
  },
};
