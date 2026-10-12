'use strict';

const { REST, Routes } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const { buildPayloads } = require('./commandHandler');

/**
 * Registra los slash commands en Discord.
 *  - SLASH_GLOBAL=true  → comandos públicos globales + de desarrollador en el servidor de soporte.
 *  - SLASH_GLOBAL=false → todo en el servidor de soporte (ideal para pruebas).
 */
async function deployCommands(commands) {
  const rest = new REST({ version: '10' }).setToken(config.token);
  const { global, developer } = buildPayloads(commands);
  const guildRoute = config.supportGuildId && Routes.applicationGuildCommands(config.clientId, config.supportGuildId);

  if (config.slashGlobal) {
    await rest.put(Routes.applicationCommands(config.clientId), { body: global });
    if (guildRoute) await rest.put(guildRoute, { body: developer });
  } else {
    await rest.put(guildRoute, { body: [...global, ...developer] });
  }

  logger.info(`Comandos registrados: ${global.length} públicos, ${developer.length} de desarrollador.`);
}

module.exports = { deployCommands };
