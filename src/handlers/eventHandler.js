'use strict';

const path = require('node:path');
const { walkJsFiles } = require('../utils/walk');
const logger = require('../utils/logger');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

/**
 * Registra cada archivo de /src/events.
 * Formato: { name: 'eventName', once?: boolean, execute(client, ...args) }
 */
function loadEvents(client) {
  for (const file of walkJsFiles(EVENTS_DIR)) {
    const event = require(file);
    if (!event?.name || typeof event.execute !== 'function') {
      logger.warn(`Evento ignorado: ${path.relative(EVENTS_DIR, file)}`);
      continue;
    }

    const listener = async (...args) => {
      try {
        await event.execute(client, ...args);
      } catch (error) {
        logger.error(`Error en el evento "${event.name}":`, error);
      }
    };

    if (event.once) client.once(event.name, listener);
    else client.on(event.name, listener);
  }
}

module.exports = { loadEvents };
