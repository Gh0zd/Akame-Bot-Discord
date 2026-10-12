'use strict';

const logger = require('./logger');

/** Envía un mensaje a un canal de logs sin romper el flujo si falla. */
async function sendToChannel(client, channelId, payload) {
  if (!channelId) return;
  try {
    const channel = client.channels.cache.get(channelId) ?? (await client.channels.fetch(channelId));
    await channel?.send(payload);
  } catch (error) {
    logger.warn(`No se pudo enviar el log al canal ${channelId}: ${error.message}`);
  }
}

module.exports = { sendToChannel };
