'use strict';

const { MessageFlags } = require('discord.js');
const { evaluate, MAX_LENGTH } = require('../utils/calculator');
const { calculatorPayload } = require('../utils/calculatorUi');

const readExpression = (interaction) => {
  const text = interaction.message.embeds[0]?.description?.replace(/```/g, '').trim() ?? '';
  return text === '0' ? '' : text;
};

module.exports = {
  kind: 'button',
  customId: /^calc:\d+:.+$/,

  async execute(interaction) {
    const t = interaction.t;
    const [, ownerId, key] = interaction.customId.split(':');
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: t('commands.calculator.onlyOwner', { user: `<@${ownerId}>` }), flags: MessageFlags.Ephemeral });
    }

    let expression = readExpression(interaction);
    if (expression === t('commands.calculator.invalid') || expression === t('commands.calculator.divisionByZero')) expression = '';

    switch (key) {
      case 'AC':
        expression = '';
        break;
      case 'DEL':
        expression = expression.slice(0, -1);
        break;
      case 'ANS':
        expression += interaction.message.embeds[0]?.footer?.text?.match(/-?[\d.]+(?:e[+-]?\d+)?$/i)?.[0] ?? '';
        break;
      case '=':
        try {
          expression = String(evaluate(expression));
        } catch (error) {
          expression = error.message === 'division' ? t('commands.calculator.divisionByZero') : t('commands.calculator.invalid');
        }
        break;
      default:
        if (expression.length < MAX_LENGTH) expression += key;
    }

    const payload = calculatorPayload(ownerId, expression, t);
    if (key === '=' && /^-?[\d.]/.test(expression)) payload.embeds[0].setFooter({ text: `Ans: ${expression}` });
    else if (interaction.message.embeds[0]?.footer?.text?.startsWith('Ans:')) payload.embeds[0].setFooter({ text: interaction.message.embeds[0].footer.text });
    await interaction.update(payload);
  },
};
