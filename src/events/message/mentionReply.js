'use strict';

const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageType, PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const { resolveLanguage, createTranslator } = require('../../utils/i18n');
const { baseEmbed } = require('../../utils/embeds');
const { canSendIn } = require('../../utils/channels');

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    if (message.author.bot || message.system || message.webhookId || !message.inGuild()) return;
    if (message.type === MessageType.Reply || !canSendIn(message.channel)) return;
    if (!new RegExp(`^<@!?${client.user.id}>\\s*$`).test(message.content)) return;

    const t = createTranslator(resolveLanguage({ userId: message.author.id, guildId: message.guildId }));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(t('common.supportServer')).setURL(config.links.support),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(t('common.inviteMe')).setURL(config.links.invite),
    );

    const canEmbed = message.channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.EmbedLinks);
    const text = t('events.mention.text', { bot: client.user.username });

    await message
      .reply(
        canEmbed
          ? { embeds: [baseEmbed({ footer: false }).setThumbnail(client.user.displayAvatarURL()).setDescription(text)], components: [row] }
          : { content: text, components: [row] },
      )
      .catch(() => {});
  },
};
