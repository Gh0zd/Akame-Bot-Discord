'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { userInfoEmbed, avatarPayload, bannerPayload, permissionsEmbed } = require('../../utils/userProfile');
const { replyError } = require('../../utils/respond');

const userOption = (sub, key) => sub.addUserOption((o) => describe(o.setName('user'), key));

module.exports = {
  data: describe(new SlashCommandBuilder().setName('user'), 'commands.user.description')
    .addSubcommand((s) => userOption(describe(s.setName('info'), 'commands.user.info'), 'commands.options.targetOptional'))
    .addSubcommand((s) => userOption(describe(s.setName('avatar'), 'commands.user.avatar'), 'commands.options.targetOptional'))
    .addSubcommand((s) => userOption(describe(s.setName('banner'), 'commands.user.banner'), 'commands.options.targetOptional'))
    .addSubcommand((s) => userOption(describe(s.setName('checkperms'), 'commands.user.checkperms'), 'commands.options.targetOptional')),
  cooldown: 5,

  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    switch (interaction.options.getSubcommand()) {
      case 'info':
        await interaction.deferReply();
        return interaction.editReply({ embeds: [await userInfoEmbed(interaction, user, member)] });
      case 'avatar':
        return interaction.reply(avatarPayload(interaction, user));
      case 'banner': {
        const payload = await bannerPayload(interaction, user);
        return payload ? interaction.reply(payload) : replyError(interaction, interaction.t('userinfo.noBanner'));
      }
      case 'checkperms':
        if (!member) return replyError(interaction, interaction.t('userinfo.notInServer'));
        return interaction.reply({ embeds: [permissionsEmbed(interaction, user, member)], flags: MessageFlags.Ephemeral });
    }
  },
};
