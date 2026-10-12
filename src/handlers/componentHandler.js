'use strict';

const path = require('node:path');
const { walkJsFiles } = require('../utils/walk');

const COMPONENTS_DIR = path.join(__dirname, '..', 'components');

/**
 * Componentes (botones, menús y modales).
 * Formato: { customId: string | RegExp, kind: 'button' | 'select' | 'modal', execute(interaction) }
 */
function loadComponents(client) {
  client.components = walkJsFiles(COMPONENTS_DIR).flatMap((file) => [require(file)].flat());
}

const matches = (customId, pattern) => (pattern instanceof RegExp ? pattern.test(customId) : pattern === customId);

function kindOf(interaction) {
  if (interaction.isButton()) return 'button';
  if (interaction.isAnySelectMenu()) return 'select';
  if (interaction.isModalSubmit()) return 'modal';
  return null;
}

function findComponent(client, interaction) {
  const kind = kindOf(interaction);
  return client.components.find((c) => c.kind === kind && matches(interaction.customId, c.customId));
}

module.exports = { loadComponents, findComponent };
