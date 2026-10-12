'use strict';

const { Events } = require('discord.js');
const config = require('../../config');
const { resolveLanguage, createTranslator } = require('../../utils/i18n');
const { runCommand, runAutocomplete } = require('../../handlers/commandRunner');
const { findComponent } = require('../../handlers/componentHandler');
const { reportError } = require('../../handlers/antiCrash');
const { respond } = require('../../utils/respond');

/** Añade `interaction.lang` y `interaction.t` para que todo el código use el idioma correcto. */
function attachLanguage(interaction) {
  interaction.lang = resolveLanguage({ userId: interaction.user.id, guildId: interaction.guildId });
  interaction.t = createTranslator(interaction.lang);
}

async function runComponent(client, interaction) {
  const component = findComponent(client, interaction);
  if (!component) return;
  try {
    await component.execute(interaction);
  } catch (error) {
    if (error?.code === 10062 || error?.message?.includes('Unknown interaction')) return;
    reportError(client, `Error en componente ${interaction.customId}`, error);
    await respond(interaction, { content: interaction.t('errors.generic', { support: config.links.support }), ephemeral: true }).catch(() => {});
  }
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    attachLanguage(interaction);

    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      const command = client.commands.get(interaction.commandName);
      return command && runCommand(client, interaction, command);
    }
    if (interaction.isAutocomplete()) {
      return runAutocomplete(interaction, client.commands.get(interaction.commandName));
    }
    return runComponent(client, interaction);
  },
};
