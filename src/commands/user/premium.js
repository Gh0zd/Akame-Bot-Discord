'use strict';

const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { premium } = require('../../database/repositories');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { discordTime } = require('../../utils/format');
const { asset, createCanvas, loadImage } = require('../../utils/canvasImages');

module.exports = {
  data: describe(new SlashCommandBuilder().setName('premium'), 'commands.premium.description'),
  cooldown: 10,
  botPermissions: ['EmbedLinks', 'AttachFiles'],

  async execute(interaction) {
    const t = interaction.t;
    const info = premium.get(interaction.user.id);
    const active = premium.isActive(interaction.user.id);

    if (!active) {
      return interaction.reply({ embeds: [baseEmbed().setDescription(t('commands.premium.none'))], flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    const canvas = createCanvas(1000, 625);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await loadImage(asset('chart.png')), 0, 0, 1000, 625);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(20, 250, 955, 350);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('Premium', 250, 70);
    ctx.font = '36px sans-serif';
    ctx.fillText(`${t('commands.premium.plan')}: ${info.plan}`, 50, 330);
    ctx.fillText(`${t('commands.premium.user')}: ${interaction.user.username}`, 50, 400);
    ctx.fillText(`${t('commands.premium.expires')}: ${new Date(info.expiresAt).toISOString().slice(0, 10)}`, 50, 470);

    const embed = baseEmbed({ footer: false }).setDescription(t('commands.premium.active', { expires: discordTime(info.expiresAt) })).setImage('attachment://premium.png');
    await interaction.editReply({ embeds: [embed], files: [new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'premium.png' })] });
  },
};
