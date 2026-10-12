'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed } = require('./embeds');

const LAYOUT = [
  ['AC', 'DEL', '(', ')', '÷'],
  ['7', '8', '9', '×', '^'],
  ['4', '5', '6', '-', '%'],
  ['1', '2', '3', '+', '='],
  ['0', '.', 'ANS'],
];

const styleOf = (key) =>
  key === '=' ? ButtonStyle.Success : key === 'AC' ? ButtonStyle.Danger : /^\d|\.$/.test(key) ? ButtonStyle.Secondary : ButtonStyle.Primary;

/** Mensaje de la calculadora. El id del dueño y la clave viajan en el customId: no se guarda estado en memoria. */
function calculatorPayload(userId, expression, t, { disabled = false } = {}) {
  const embed = baseEmbed()
    .setTitle(t('commands.calculator.title'))
    .setDescription(`\`\`\`\n${expression || '0'}\n\`\`\``);

  const rows = LAYOUT.map((keys) =>
    new ActionRowBuilder().addComponents(
      keys.map((key) =>
        new ButtonBuilder().setCustomId(`calc:${userId}:${key}`).setLabel(key).setStyle(styleOf(key)).setDisabled(disabled),
      ),
    ),
  );
  return { embeds: [embed], components: rows };
}

module.exports = { calculatorPayload };
