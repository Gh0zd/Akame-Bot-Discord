'use strict';

const util = require('node:util');
const { MessageFlags } = require('discord.js');
const config = require('../config');

module.exports = {
  kind: 'modal',
  customId: 'eval_modal',

  async execute(interaction) {
    // Doble comprobación: aunque el comando no se registre, el modal nunca corre sin permiso explícito.
    if (!config.enableEval || !config.ownerIds.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌', flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const code = interaction.fields.getTextInputValue('code');
    try {
      let result = await eval(code); // eslint-disable-line no-eval
      if (typeof result !== 'string') result = util.inspect(result, { depth: 1 });
      const safe = result.replaceAll(config.token, '[TOKEN]');
      await interaction.editReply(`\`\`\`js\n${safe.slice(0, 1900)}\n\`\`\``);
    } catch (error) {
      await interaction.editReply(`\`\`\`js\n${String(error).slice(0, 1900)}\n\`\`\``);
    }
  },
};
