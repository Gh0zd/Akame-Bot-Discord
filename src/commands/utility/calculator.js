'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe, rename } = require('../../utils/localize');
const { calculatorPayload } = require('../../utils/calculatorUi');

module.exports = {
  data: rename(describe(new SlashCommandBuilder().setName('calculator'), 'commands.calculator.description'), 'commands.calculator.name'),
  cooldown: 5,
  allowDM: true,
  execute: (interaction) => interaction.reply(calculatorPayload(interaction.user.id, '', interaction.t)),
};
