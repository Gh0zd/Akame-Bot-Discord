'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { pick } = require('../../utils/format');

const DICE_GIFS = [
  'https://i.ibb.co/7tftzCR6/1.webp',
  'https://i.ibb.co/spvG80p6/2.webp',
  'https://i.ibb.co/Xxs1DzZf/3.webp',
  'https://i.ibb.co/pBfVPTrN/4.webp',
  'https://i.ibb.co/7HX5jZL/5.webp',
  'https://i.ibb.co/wmdRsFD/6.webp',
];

module.exports = {
  data: describe(new SlashCommandBuilder().setName('roll'), 'commands.roll.description'),
  cooldown: 3,

  async execute(interaction) {
    const embed = baseEmbed({ footer: false })
      .setColor('Random')
      .setDescription(interaction.t('commands.roll.rolled', { user: interaction.user.username }))
      .setImage(pick(DICE_GIFS));
    await interaction.reply({ embeds: [embed] });
  },
};
