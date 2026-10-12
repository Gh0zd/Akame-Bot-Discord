'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { afk } = require('../../database/repositories');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');

const AFK_PREFIX = '[AFK] ';

module.exports = {
  data: describe(new SlashCommandBuilder().setName('afk'), 'commands.afk.description').addStringOption((option) =>
    describe(option.setName('reason').setMaxLength(200), 'commands.afk.options.reason'),
  ),
  cooldown: 3,

  async execute(interaction) {
    const t = interaction.t;
    const { guildId, user, member } = interaction;

    if (afk.get(guildId, user.id)) {
      return interaction.reply({ content: t('commands.afk.already'), flags: MessageFlags.Ephemeral });
    }

    const reason = interaction.options.getString('reason') ?? t('commands.afk.noReason');
    afk.set(guildId, user.id, reason);

    if (!member.displayName.startsWith(AFK_PREFIX)) {
      await member.setNickname(`${AFK_PREFIX}${member.displayName}`.slice(0, 32)).catch(() => {});
    }

    const embed = baseEmbed()
      .setTitle(user.username)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(t('commands.afk.description_set', { user: user.toString(), reason }))
      .setFooter({ text: t('commands.afk.footer'), iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ content: t('commands.afk.set'), embeds: [embed] });
  },
};
