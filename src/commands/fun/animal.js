'use strict';

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const translate = require('../../utils/translate');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');

const API = 'https://api.some-random-api.com/animal';
const ANIMALS = {
  dog: { emoji: '🐶', api: 'dog' },
  cat: { emoji: '🐱', api: 'cat' },
  panda: { emoji: '🐼', api: 'panda' },
  fox: { emoji: '🦊', api: 'fox' },
  bird: { emoji: '🐦', api: 'birb' },
  koala: { emoji: '🐨', api: 'koala' },
};

module.exports = {
  data: describe(new SlashCommandBuilder().setName('animal'), 'commands.animal.description').addStringOption((option) =>
    describe(option.setName('type').setRequired(true), 'commands.animal.options.type').addChoices(
      ...Object.entries(ANIMALS).map(([value, { emoji }]) => ({ name: `${emoji} ${value}`, value })),
    ),
  ),
  cooldown: 3,
  botPermissions: ['EmbedLinks', 'AttachFiles'],

  async execute(interaction) {
    const t = interaction.t;
    const type = interaction.options.getString('type', true);
    await interaction.deferReply();

    let data;
    try {
      ({ data } = await axios.get(`${API}/${ANIMALS[type].api}`, { timeout: 5000 }));
    } catch {
      return replyError(interaction, t('commands.animal.failed'));
    }

    // El dato llega en inglés: se traduce al idioma activo salvo que ya sea inglés.
    const fact = interaction.lang === 'en' ? data.fact : (await translate(data.fact, { to: interaction.lang }).catch(() => null))?.text ?? data.fact;

    const embed = baseEmbed({ footer: false })
      .setTitle(t('commands.animal.title', { animal: t(`commands.animal.names.${type}`) }))
      .setImage(data.image)
      .setDescription(`> ${fact}`)
      .setFooter({ text: t('common.requestedBy', { user: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() });
    await interaction.editReply({ embeds: [embed] });
  },
};
