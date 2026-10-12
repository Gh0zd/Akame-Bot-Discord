'use strict';

const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const DIG = require('discord-image-generation');
const { describe } = require('../../utils/localize');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');
const { asset, createCanvas, loadImage } = require('../../utils/canvasImages');

/** Efectos de discord-image-generation: subcomando → [clase, extensión]. */
const DIG_EFFECTS = {
  delete: ['Delete'], wanted: ['Wanted'], trash: ['Trash'], triggered: ['Triggered', 'gif'], rip: ['Rip'],
  bobross: ['Bobross'], facepalm: ['Facepalm'], poutine: ['Poutine'], ad: ['Ad'], mms: ['Mms'], jail: ['Jail'],
  stonk: ['Stonk'], notstonk: ['NotStonk'], confusedstonk: ['ConfusedStonk'], clown: ['Clown'],
};

/** Imágenes compuestas con plantillas propias (/assets/Image). */
const TEMPLATES = {
  simpcard: {
    file: 'simpcard.png', width: 1280, height: 720,
    draw(ctx, avatar, { user, date }) {
      ctx.drawImage(avatar, 100, 75, 320, 360);
      ctx.font = '45px sans-serif';
      ctx.fillText(user.username, 230, 505);
      ctx.fillText(date, 75, 620);
    },
  },
  plsbro: {
    file: 'pleasebro.png', width: 762, height: 402,
    draw: (ctx, avatar) => ctx.drawImage(avatar, 382, 12, 200, 200),
  },
};

const data = describe(new SlashCommandBuilder().setName('image'), 'commands.image.description');
const userOption = (sub) => sub.addUserOption((o) => describe(o.setName('user'), 'commands.options.targetOptional'));
for (const name of [...Object.keys(DIG_EFFECTS), ...Object.keys(TEMPLATES)]) {
  data.addSubcommand((sub) => userOption(describe(sub.setName(name), `commands.image.effects.${name}`)));
}

/** Imágenes con texto. `render` devuelve un Buffer PNG. */
const TEXT_EFFECTS = {
  trump: { label: '[🎩] Trump', max: 30, render: (text) => drawText('trump.png', 600, 450, text, { font: '28px sans-serif', x: 430, y: 160, width: 150, line: 30, rotate: 0.11 }) },
  machievement: { label: '[🎮] Machievement', max: 40, render: (text) => drawText('achi.png', 680, 167, text, { font: '22px sans-serif', color: '#cfcdcb', x: 149, y: 92, width: 500, line: 26 }) },
  note: { label: '[📝] Note', max: 60, render: (text) => drawText('note.png', 512, 512, text, { font: '32px sans-serif', x: 60, y: 80, width: 240, line: 38 }) },
  minecraft: {
    label: '[⛏️] Minecraft',
    max: 21,
    render: async (text) =>
      Buffer.from((await axios.get(`https://skinmc.net/en/achievement/12/Achievement%20Get!/${encodeURIComponent(text)}`, { responseType: 'arraybuffer', timeout: 10_000 })).data),
  },
  lisa: { label: '[🎞] Lisa', max: 30, render: (text) => new DIG.LisaPresentation().getImage(text) },
};

/** Dibuja `text` con salto de línea automático sobre una plantilla de /assets/Image. */
async function drawText(file, width, height, text, { font, color = '#000000', x, y, width: maxWidth, line, rotate = 0 }) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(await loadImage(asset(file)), 0, 0, width, height);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.rotate(rotate);

  let current = '';
  let cursorY = y;
  for (const word of text.split(/\s+/)) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      ctx.fillText(current, x, cursorY);
      current = word;
      cursorY += line;
    } else {
      current = attempt;
    }
  }
  ctx.fillText(current, x, cursorY);
  return canvas.toBuffer('image/png');
}

async function renderText(interaction) {
  const t = interaction.t;
  const key = interaction.options.getString('option', true);
  const text = interaction.options.getString('message', true).trim();
  const effect = TEXT_EFFECTS[key];

  const isAdmin = interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
  if (!isAdmin && (hasForbiddenWords(text) || /https?:\/\/|discord\.gg|www\./i.test(text))) {
    return { error: t('commands.image.textBlocked') };
  }
  if (text.length > effect.max) return { error: t('commands.image.textTooLong', { max: effect.max }) };
  return { buffer: await effect.render(text), extension: 'png', name: key };
}

async function renderTemplate(name, user, interaction) {
  const { file, width, height, draw } = TEMPLATES[name];
  const [background, avatar] = await Promise.all([loadImage(asset(file)), loadImage(user.displayAvatarURL({ extension: 'jpg', size: 512 }))]);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(background, 0, 0, width, height);
  draw(ctx, avatar, { user, date: interaction.createdAt.toLocaleDateString(interaction.lang) });
  return { buffer: canvas.toBuffer('image/png'), extension: 'png' };
}

async function renderEffect(name, user) {
  const [className, extension = 'png'] = DIG_EFFECTS[name];
  const buffer = await new DIG[className]().getImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
  return { buffer, extension };
}

data.addSubcommand((sub) =>
  describe(sub.setName('text'), 'commands.image.effects.text')
    .addStringOption((o) =>
      describe(o.setName('option').setRequired(true), 'commands.image.options.textOption').addChoices(
        ...Object.entries(TEXT_EFFECTS).map(([value, { label }]) => ({ name: label, value })),
      ),
    )
    .addStringOption((o) => describe(o.setName('message').setRequired(true).setMaxLength(60), 'commands.image.options.message')),
);

module.exports = {
  data,
  cooldown: 5,
  botPermissions: ['EmbedLinks', 'AttachFiles'],

  async execute(interaction) {
    const name = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user') ?? interaction.user;
    await interaction.deferReply();

    try {
      const result =
        name === 'text' ? await renderText(interaction) : name in TEMPLATES ? await renderTemplate(name, user, interaction) : await renderEffect(name, user);
      if (result.error) return replyError(interaction, result.error);
      await interaction.editReply({ files: [new AttachmentBuilder(result.buffer, { name: `${result.name ?? name}.${result.extension}` })] });
    } catch (error) {
      await replyError(interaction, interaction.t('commands.image.failed'));
      throw error;
    }
  },
};
