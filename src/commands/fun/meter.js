'use strict';

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');
const { requestedByRow } = require('../../utils/requestedBy');
const { avatarWithOverlay } = require('../../utils/canvasImages');
const { randomInt, progressBar } = require('../../utils/format');

const FILLED_FALLBACK = '🟩';
const EMPTY_FALLBACK = '⬜';

function meterBar(guild, percent) {
  const filled = guild?.emojis.cache.find((emoji) => emoji.name === 'Barra_verde')?.toString() ?? FILLED_FALLBACK;
  const empty = guild?.emojis.cache.find((emoji) => emoji.name === 'Barra_gris')?.toString() ?? EMPTY_FALLBACK;
  return progressBar(Math.floor(percent / 10), 11, filled, empty);
}

/** Medidores aleatorios que superponen una imagen sobre el avatar (/meter gay | simp). */
const METERS = {
  gay: { overlay: 'gay.png', size: 512, max: 110 },
  simp: { overlay: 'acosador.png', size: 1024, max: 100 },
};

module.exports = {
  data: describe(new SlashCommandBuilder().setName('meter'), 'commands.meter.description')
    .addSubcommand((sub) =>
      describe(sub.setName('gay'), 'commands.meter.gay.description').addUserOption((o) =>
        describe(o.setName('user'), 'commands.options.targetOptional'),
      ),
    )
    .addSubcommand((sub) =>
      describe(sub.setName('simp'), 'commands.meter.simp.description').addUserOption((o) =>
        describe(o.setName('user'), 'commands.options.targetOptional'),
      ),
    ),
  cooldown: 5,
  botPermissions: ['EmbedLinks', 'AttachFiles'],

  async execute(interaction) {
    const t = interaction.t;
    const kind = interaction.options.getSubcommand();
    const meter = METERS[kind];
    const user = interaction.options.getUser('user') ?? interaction.user;
    if (hasForbiddenWords(user.username)) return replyError(interaction, t('errors.inappropriateName'));

    await interaction.deferReply();

    const percent = randomInt(0, meter.max);
    const image = await avatarWithOverlay(user.displayAvatarURL({ extension: 'png', size: 512 }), meter.overlay, meter.size);
    const file = new AttachmentBuilder(image, { name: `${kind}.png` });
    const bar = meterBar(interaction.guild, percent);

    const embed = baseEmbed({ footer: false })
      .setTitle(t(`commands.meter.${kind}.title`))
      .setDescription(t(`commands.meter.${kind}.question`, { user: user.username }))
      .setImage(`attachment://${kind}.png`)
      .addFields({ name: t(`commands.meter.${kind}.result`), value: `${bar} ${percent}%` });

    await interaction.editReply({ embeds: [embed], files: [file], components: [requestedByRow(interaction, kind)] });
  },
  meterBar,
};
