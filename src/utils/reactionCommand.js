'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { describe, rename } = require('./localize');
const { baseEmbed } = require('./embeds');
const { replyError } = require('./respond');
const { fetchGif } = require('./gifActions');
const { counters } = require('../database/repositories');

/**
 * Crea un comando con un subcomando por acción: /interact hug @user, /react cry.
 * Texto según el caso: sin objetivo o uno mismo → "self", otro usuario → "target", el bot → "bot".
 */
function createReactionCommand(name, actions) {
  const data = rename(describe(new SlashCommandBuilder().setName(name), `commands.${name}.description`), `commands.${name}.name`);
  for (const action of Object.keys(actions)) {
    data.addSubcommand((sub) =>
      describe(sub.setName(action), `reactions.${action}.description`).addUserOption((option) =>
        describe(option.setName('user'), 'reactions.userOption'),
      ),
    );
  }

  return {
    data,
    cooldown: 3,

    async execute(interaction) {
      const t = interaction.t;
      const action = interaction.options.getSubcommand();
      const { sources, counter } = actions[action];
      const target = interaction.options.getUser('user');
      const author = interaction.user;

      const isBot = target?.id === interaction.client.user.id;
      const isSelf = !target || target.id === author.id;
      const caseKey = isBot ? 'bot' : isSelf ? 'self' : 'target';
      const vars = { user: author.username, target: target?.username ?? '' };

      await interaction.deferReply();

      let url;
      try {
        url = await fetchGif(sources);
      } catch {
        return replyError(interaction, t('reactions.apiError'));
      }

      let description = t(`reactions.${action}.${caseKey}`, vars);
      if (counter && caseKey === 'target' && !target.bot) {
        const count = counters.increment(target.id, action);
        description += `\n${t(`reactions.counter.${action}`, { ...vars, count })}`;
      }

      const embed = baseEmbed({ footer: false }).setColor('Random').setDescription(description).setImage(url).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    },
  };
}

module.exports = { createReactionCommand };
