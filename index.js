'use strict';

const { Collection } = require('discord.js');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const { openDatabase, closeDatabase } = require('./src/database');
const { loadLocales } = require('./src/utils/i18n');
const { createClient } = require('./src/client');
const { loadCommands } = require('./src/handlers/commandHandler');
const { loadEvents } = require('./src/handlers/eventHandler');
const { loadComponents } = require('./src/handlers/componentHandler');
const { deployCommands } = require('./src/handlers/deployCommands');
const { registerAntiCrash } = require('./src/handlers/antiCrash');

async function main() {
  config.validate();

  openDatabase(config.databasePath);
  loadLocales(); // debe ir antes de cargar comandos: sus builders usan traducciones

  const client = createClient();
  registerAntiCrash(client);

  loadCommands(client.commands);
  loadComponents(client);
  loadEvents(client);
  logger.info(`Cargados ${client.commands.size} comandos y ${client.components.length} componentes.`);

  if (config.autoDeploy) await deployCommands(client.commands);

  const shutdown = async (signal) => {
    logger.info(`${signal} recibido, cerrando...`);
    await client.destroy();
    closeDatabase();
    process.exit(0);
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  await client.login(config.token);
}

main().catch((error) => {
  logger.error('No se pudo iniciar el bot:', error);
  process.exit(1);
});
