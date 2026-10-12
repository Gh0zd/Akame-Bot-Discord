'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const TIMEOUT_MS = 120_000;

/** Muestra varios embeds con botones anterior/siguiente. Solo quien ejecutó el comando puede navegar. */
async function paginate(interaction, embeds) {
  let index = 0;
  const render = (disabled = false) => ({
    embeds: [embeds[index].setFooter({ text: `${index + 1}/${embeds.length}` })],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('page_prev').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(disabled || index === 0),
        new ButtonBuilder().setCustomId('page_next').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(disabled || index === embeds.length - 1),
      ),
    ],
  });

  const response = await interaction.reply({ ...render(), withResponse: true });
  const message = response.resource.message;

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: TIMEOUT_MS,
    filter: (click) => click.user.id === interaction.user.id,
  });

  collector.on('collect', async (click) => {
    index += click.customId === 'page_next' ? 1 : -1;
    await click.update(render());
  });
  collector.on('end', () => interaction.editReply(render(true)).catch(() => {}));
}

module.exports = { paginate };
