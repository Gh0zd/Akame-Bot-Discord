'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('restart'), 'commands.restart.description'),
  developerOnly: true,

  async execute(interaction) {
    await interaction.reply({ embeds: [baseEmbed({ footer: false }).setDescription(interaction.t('commands.restart.restarting'))] });
    // Requiere un gestor de procesos (pm2, systemd, Docker restart policy…) que vuelva a levantar el bot.
    process.exit(0);
  },
};
