'use strict';

const { helpPayload } = require('../utils/helpMenu');

module.exports = {
  kind: 'select',
  customId: 'help_category',
  execute: (interaction) => interaction.update(helpPayload(interaction, interaction.values[0])),
};
