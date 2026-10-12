'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');
const { requestedByRow } = require('../../utils/requestedBy');
const { randomInt, progressBar } = require('../../utils/format');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('banana'), 'commands.banana.description').addUserOption((option) =>
    describe(option.setName('user'), 'commands.options.targetOptional'),
  ),
  cooldown: 3,

  async execute(interaction) {
    const t = interaction.t;
    const user = interaction.options.getUser('user') ?? interaction.user;
    if (hasForbiddenWords(user.username)) return replyError(interaction, t('errors.inappropriateName'));

    const cm = randomInt(0, 24);
    const bar = progressBar(Math.floor(cm / 5), 10, '⬜', '⬛');

    const embed = baseEmbed({ footer: false })
      .setTitle(t('commands.banana.title'))
      .setDescription(t('commands.banana.question', { user: user.username }))
      .setImage('https://i.ibb.co/tTgbWyTD/Banana.webp')
      .addFields({ name: t('commands.banana.measures', { user: user.username }), value: `${bar} ${cm}cm` });
    await interaction.reply({ embeds: [embed], components: [requestedByRow(interaction, 'banana')] });
  },
};
