'use strict';

const logger = require('../utils/logger');
const config = require('../config');
const { sendToChannel } = require('../utils/channelLog');
const { baseEmbed } = require('../utils/embeds');
const { truncate } = require('../utils/format');

function reportError(client, title, error) {
  const detail = error?.stack ?? String(error);
  logger.error(title, detail);
  if (!client?.isReady()) return;

  const embed = baseEmbed({ footer: false, color: config.colors.error })
    .setTitle(title)
    .setDescription(`\`\`\`js\n${truncate(detail, 3900)}\n\`\`\``)
    .setTimestamp();
  sendToChannel(client, config.channels.error, { embeds: [embed] });
}

/** Evita que errores no controlados tiren el proceso y los registra. */
function registerAntiCrash(client) {
  process.on('unhandledRejection', (reason) => reportError(client, 'Unhandled Rejection', reason));
  process.on('uncaughtException', (error) => reportError(client, 'Uncaught Exception', error));
  client.on('error', (error) => reportError(client, 'Discord client error', error));
  client.on('warn', (message) => logger.warn(message));
}

module.exports = { registerAntiCrash, reportError };
