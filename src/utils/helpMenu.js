'use strict';

const { ActionRowBuilder, StringSelectMenuBuilder, ApplicationCommandType } = require('discord.js');
const { baseEmbed } = require('./embeds');

const HIDDEN_CATEGORIES = new Set(['developer', 'context']);
const CATEGORY_EMOJIS = { info: '📂', utility: '🔭', fun: '🍀', games: '🎮', images: '🎨', search: '🔍', server: '⚜️', user: '🦝', settings: '⚙️', interaction: '💘' };

/** Agrupa los comandos visibles por categoría. */
function groupCommands(client) {
  const groups = new Map();
  for (const command of client.commands.values()) {
    if (HIDDEN_CATEGORIES.has(command.category) || command.data.type === ApplicationCommandType.User) continue;
    if (!groups.has(command.category)) groups.set(command.category, []);
    groups.get(command.category).push(command);
  }
  return groups;
}

function helpPayload(interaction, selected = null) {
  const { t, client } = interaction;
  const groups = groupCommands(client);
  const embed = baseEmbed().setThumbnail(client.user.displayAvatarURL());

  if (selected && groups.has(selected)) {
    embed.setTitle(`${CATEGORY_EMOJIS[selected] ?? '📁'} ${t(`help.categories.${selected}`)}`).setDescription(
      groups
        .get(selected)
        .map((command) => `> \`/${command.data.name}\` — ${t(`commands.${command.data.name}.description`)}`)
        .join('\n'),
    );
  } else {
    embed.setTitle(t('help.title')).setDescription(t('help.intro', { count: [...groups.values()].flat().length }));
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('help_category')
    .setPlaceholder(t('help.placeholder'))
    .addOptions([...groups.keys()].map((key) => ({ label: t(`help.categories.${key}`), value: key, emoji: CATEGORY_EMOJIS[key], default: key === selected })));

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

module.exports = { helpPayload };
