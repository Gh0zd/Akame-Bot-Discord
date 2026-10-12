'use strict';

const { avatarPayload } = require('../utils/userProfile');
const { baseEmbed } = require('../utils/embeds');

module.exports = {
  kind: 'select',
  customId: /^avatar_size:\d+$/,

  async execute(interaction) {
    const userId = interaction.customId.split(':')[1];
    const size = Number(interaction.values[0]);
    const user = await interaction.client.users.fetch(userId);
    const payload = avatarPayload(interaction, user);
    payload.embeds = [baseEmbed({ footer: false }).setAuthor({ name: interaction.t('userinfo.avatarOf', { user: user.username }) }).setImage(user.displayAvatarURL({ size }))];
    await interaction.update(payload);
  },
};
