'use strict';

const path = require('node:path');
const { InteractionContextType } = require('discord.js');
const { walkJsFiles } = require('../utils/walk');
const logger = require('../utils/logger');

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

/** Carga todos los comandos de /src/commands y devuelve una Map nombre → módulo. */
function loadCommands(target = new Map()) {
  for (const file of walkJsFiles(COMMANDS_DIR)) {
    const command = require(file);

    if (!command?.data || typeof command.execute !== 'function') {
      logger.warn(`Comando ignorado (le falta "data" o "execute"): ${path.relative(COMMANDS_DIR, file)}`);
      continue;
    }
    if (command.enabled === false) continue;

    command.category ??= path.basename(path.dirname(file)); // carpeta = categoría (para /help)
    const { name } = command.data;
    if (target.has(name)) {
      logger.warn(`Comando duplicado "${name}" en ${path.relative(COMMANDS_DIR, file)}`);
      continue;
    }

    // Por defecto los comandos solo existen en servidores (no en MD).
    if (!command.allowDM) command.data.setContexts(InteractionContextType.Guild);

    target.set(name, command);
  }
  return target;
}

/** Separa los payloads: los comandos de desarrollador solo se registran en el servidor de soporte. */
function buildPayloads(commands) {
  const global = [];
  const developer = [];
  for (const command of commands.values()) {
    (command.developerOnly ? developer : global).push(command.data.toJSON());
  }
  return { global, developer };
}

module.exports = { loadCommands, buildPayloads };
