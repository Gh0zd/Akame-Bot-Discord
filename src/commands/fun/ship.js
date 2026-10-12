'use strict';

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');
const { hasForbiddenWords } = require('../../utils/forbidden');
const { createCanvas, loadImage } = require('../../utils/canvasImages');
const { randomInt, progressBar } = require('../../utils/format');

const BACKGROUND = 'https://i.ibb.co/BVPWYjXp/tets.png';
const HEARTS = {
  10: 'https://i.ibb.co/TMGh3tHZ/corazon.png',
  20: 'https://i.ibb.co/4g54Z1y3/crying-face.png',
  30: 'https://i.ibb.co/TMGh3tHZ/corazon.png',
  40: 'https://i.ibb.co/1G8Wm3kP/thinking-face.png',
  50: 'https://i.ibb.co/d4sbBSRw/heart-with-arrow.png',
  80: 'https://i.ibb.co/ccVjwLW9/fire.png',
  90: 'https://i.ibb.co/xqNtRcDj/sparkling-heart.png',
  100: 'https://i.ibb.co/9HLF4w7P/corazon-rosa.png',
};

/** Devuelve el valor del primer umbral >= porcentaje. */
const byThreshold = (table, percent) => {
  const thresholds = Object.keys(table).map(Number).sort((a, b) => a - b);
  return table[thresholds.find((limit) => percent <= limit) ?? thresholds.at(-1)];
};

const mixNames = (a, b) => `${a.slice(0, Math.floor(a.length / 2))}${b.slice(Math.floor(b.length / 2))}`;

function drawAvatar(ctx, image, centerX, x) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, 100, 77.5, 0, 2 * Math.PI);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(image, x, 22.5, 155, 155);
  ctx.restore();
}

async function renderShip(urlA, urlB, heartUrl) {
  const canvas = createCanvas(618, 200);
  const ctx = canvas.getContext('2d');
  const [bg, a, b, heart] = await Promise.all([BACKGROUND, urlA, urlB, heartUrl].map(loadImage));

  ctx.save();
  ctx.filter = 'blur(3px)';
  ctx.drawImage(bg, 0, 0, 618, 200);
  ctx.restore();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#000000';
  ctx.fillRect(17, 17, 576, 166);
  ctx.globalAlpha = 1;
  drawAvatar(ctx, a, 124.5, 47);
  drawAvatar(ctx, b, 485.5, 400);
  ctx.drawImage(heart, 227.5, 22.5, 155, 155);
  return canvas.toBuffer('image/png');
}

module.exports = {
  data: describe(new SlashCommandBuilder().setName('ship'), 'commands.ship.description')
    .addUserOption((o) => describe(o.setName('user1').setRequired(true), 'commands.ship.options.user1'))
    .addUserOption((o) => describe(o.setName('user2'), 'commands.ship.options.user2')),
  cooldown: 5,
  botPermissions: ['EmbedLinks', 'AttachFiles'],

  async execute(interaction) {
    const t = interaction.t;
    const first = interaction.options.getUser('user1', true);
    const second = interaction.options.getUser('user2') ?? interaction.user;
    if (hasForbiddenWords(first.username) || hasForbiddenWords(second.username)) {
      return replyError(interaction, t('errors.inappropriateName'));
    }

    await interaction.deferReply();

    const percent = randomInt(1, 100);
    const messageKeys = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const message = t(`commands.ship.messages.${byThreshold(Object.fromEntries(messageKeys.map((k) => [k, k])), percent)}`);
    const avatar = (user) => user.displayAvatarURL({ extension: 'png', size: 256 });
    const image = await renderShip(avatar(first), avatar(second), byThreshold(HEARTS, percent));

    const embed = baseEmbed({ footer: false })
      .setTitle(`💞 ${t('commands.ship.title')}`)
      .setDescription(`**${first.username}** ❤️ **${second.username}**\n${message}`)
      .setImage('attachment://ship.png')
      .addFields(
        { name: t('commands.ship.name'), value: mixNames(first.username, second.username), inline: true },
        { name: t('commands.ship.compatibility'), value: `[${progressBar(Math.floor(percent / 10), 10, '🟥', '⬛')}] ${percent}%`, inline: true },
      );
    await interaction.editReply({ embeds: [embed], files: [new AttachmentBuilder(image, { name: 'ship.png' })] });
  },
};
