'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const voucher = require('voucher-code-generator');
const moment = require('moment');
const { premium } = require('../../database/repositories');
const { describe } = require('../../utils/localize');
const { baseEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('generate'), 'commands.generate.description')
    .addStringOption((o) =>
      describe(o.setName('plan').setRequired(true), 'commands.generate.options.plan').addChoices(
        ...Object.keys(premium.PLANS).map((plan) => ({ name: plan, value: plan })),
      ),
    )
    .addIntegerOption((o) => describe(o.setName('amount').setMinValue(1).setMaxValue(25), 'commands.generate.options.amount')),
  developerOnly: true,

  async execute(interaction) {
    const t = interaction.t;
    const plan = interaction.options.getString('plan', true);
    const amount = interaction.options.getInteger('amount') ?? 1;

    const { codes, expiresAt } = premium.createCodes(plan, amount, () => voucher.generate({ pattern: '####-####-####' })[0].toUpperCase());
    if (!codes.length) return interaction.reply({ embeds: [errorEmbed(t('commands.generate.none'))], flags: MessageFlags.Ephemeral });

    const embed = baseEmbed({ footer: false })
      .setAuthor({ name: t('commands.generate.title') })
      .setDescription(
        `${t('commands.generate.generated', { count: codes.length })}\n\`\`\`\n${codes.map((c, i) => `${i + 1} - ${c}`).join('\n')}\n\`\`\`\n` +
          `${t('commands.generate.plan')}: \`${plan}\`\n${t('commands.generate.expires')}: \`${moment(expiresAt).format('YYYY-MM-DD')}\``,
      )
      .setFooter({ text: t('commands.generate.footer') });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
