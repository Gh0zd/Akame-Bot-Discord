'use strict';

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { Canvas } = require('canvacord');
const DIG = require('discord-image-generation');
const canvafy = require('canvafy');
const { describe, rename } = require('../../utils/localize');
const { replyError } = require('../../utils/respond');

const FILTERS = {
  lgbt: { label: '🎨 Lgbt+', apply: (img) => new DIG.Gay().getImage(img) },
  pixelate: { label: '🔳 Pixelate', apply: (img) => Canvas.pixelate(img, 8) },
  burn: { label: '🌋 Burn', apply: (img) => Canvas.burn(img, 4) },
  sepia: { label: '📷 Sepia', apply: (img) => Canvas.sepia(img, 4) },
  invert: { label: '🔄 Invert', apply: (img) => Canvas.invert(img, 4) },
  blur: { label: '🌫️ Blur', apply: (img) => Canvas.blur(img, 4) },
  greyscale: { label: '👤 Greyscale', apply: (img) => Canvas.greyscale(img) },
  deepfry: { label: '🔥 Deepfry', apply: (img) => new DIG.Deepfry().getImage(img) },
  darkness: { label: '🌑 Darkness', apply: (img) => canvafy.Image.darkness(img, 100) },
};

module.exports = {
  data: rename(describe(new SlashCommandBuilder().setName('filters'), 'commands.filters.description'), 'commands.filters.name')
    .addStringOption((o) =>
      describe(o.setName('filter').setRequired(true), 'commands.filters.options.filter').addChoices(
        ...Object.entries(FILTERS).map(([value, { label }]) => ({ name: label, value })),
      ),
    )
    .addUserOption((o) => describe(o.setName('user'), 'commands.options.targetOptional')),
  cooldown: 5,
  botPermissions: ['EmbedLinks', 'AttachFiles'],

  async execute(interaction) {
    const key = interaction.options.getString('filter', true);
    const user = interaction.options.getUser('user') ?? interaction.user;
    await interaction.deferReply();

    try {
      const image = await FILTERS[key].apply(user.displayAvatarURL({ extension: 'png', size: 512 }));
      await interaction.editReply({ files: [new AttachmentBuilder(image, { name: `${key}.png` })] });
    } catch (error) {
      await replyError(interaction, interaction.t('commands.image.failed'));
      throw error; // lo registra el runner
    }
  },
};
