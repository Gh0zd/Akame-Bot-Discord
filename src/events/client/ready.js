'use strict';

const { Events, ActivityType } = require('discord.js');
const config = require('../../config');
const logger = require('../../utils/logger');
const { premium, welcome } = require('../../database/repositories');
const { cacheGuildInvites } = require('../../utils/inviteTracker');
const { sendToChannel } = require('../../utils/channelLog');
const { baseEmbed } = require('../../utils/embeds');
const { pick } = require('../../utils/format');

const PRESENCE_INTERVAL_MS = 30_000;
const PREMIUM_CHECK_INTERVAL_MS = 60_000;

function startPresenceRotation(client) {
  const update = () => {
    const servers = client.guilds.cache.size;
    const members = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
    const options = [
      { type: ActivityType.Playing, name: '/help | /invite' },
      { type: ActivityType.Watching, name: `${members.toLocaleString()} Users` },
      { type: ActivityType.Competing, name: `${servers.toLocaleString()} Servers` },
    ];
    const { name, type } = pick(options);
    client.user.setActivity(name, { type });
  };
  update();
  setInterval(update, PRESENCE_INTERVAL_MS).unref();
}

function startPremiumExpiry() {
  setInterval(() => {
    try {
      const expired = premium.expireOutdated();
      if (expired) logger.info(`Premium vencido en ${expired} cuenta(s).`);
    } catch (error) {
      logger.error('No se pudo revisar la expiración de premium:', error);
    }
  }, PREMIUM_CHECK_INTERVAL_MS).unref();
}

/** Solo cachea invitaciones en servidores que usan la bienvenida (evita llamadas innecesarias). */
function warmInviteCache(client) {
  for (const guild of client.guilds.cache.values()) {
    if (welcome.get(guild.id)?.channelId) cacheGuildInvites(guild);
  }
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Conectado como ${client.user.tag} en ${client.guilds.cache.size} servidores.`);
    startPresenceRotation(client);
    startPremiumExpiry();
    warmInviteCache(client);

    const embed = baseEmbed({ footer: false })
      .setDescription(`**${client.user.username}** is \`Online and Ready!\``)
      .setTimestamp();
    sendToChannel(client, config.channels.log, { embeds: [embed] });
  },
};
