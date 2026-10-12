'use strict';

const config = require('./src/config');
const logger = require('./src/utils/logger');
const { openDatabase } = require('./src/database');
const { loadLocales } = require('./src/utils/i18n');
const { loadCommands } = require('./src/handlers/commandHandler');
const { deployCommands } = require('./src/handlers/deployCommands');

(async () => {
  config.validate();
  openDatabase(config.databasePath); // los builders usan i18n, que consulta idiomas guardados
  loadLocales();
  await deployCommands(loadCommands());
})().catch((error) => {
  logger.error('No se pudieron registrar los comandos:', error);
  process.exit(1);
});
