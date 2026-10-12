'use strict';

const { SlashCommandBuilder, ChannelType, GuildVerificationLevel, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');
const { discordTime, truncate } = require('../../utils/format');

const TEXT_LIKE = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread];

module.exports = {
  data: describe(new SlashCommandBuilder().setName('server'), 'commands.server.description')
    .addSubcommand((s) => describe(s.setName('info'), 'commands.server.info'))
    .addSubcommand((s) =>
      describe(s.setName('images'), 'commands.server.images').addStringOption((o) =>
        describe(o.setName('type').setRequired(true), 'commands.server.options.imageType').addChoices(
          { name: 'Banner', value: 'banner' },
          { name: 'Icon', value: 'icon' },
          { name: 'Splash', value: 'splash' },
        ),
      ),
    )
    .addSubcommand((s) => describe(s.setName('members'), 'commands.server.members'))
    .addSubcommand((s) =>
      describe(s.setName('first-message'), 'commands.server.firstMessage').addChannelOption((o) =>
        describe(o.setName('channel').addChannelTypes(...TEXT_LIKE), 'commands.server.options.channel'),
      ),
    )
    .addSubcommand((s) =>
      describe(s.setName('channel-info'), 'commands.server.channelInfo').addChannelOption((o) =>
        describe(o.setName('channel').setRequired(true), 'commands.server.options.channel'),
      ),
    )
    .addSubcommand((s) =>
      describe(s.setName('role-info'), 'commands.server.roleInfo').addRoleOption((o) =>
        describe(o.setName('role').setRequired(true), 'commands.server.options.role'),
      ),
    )
    .addSubcommand((s) =>
      describe(s.setName('invite-info'), 'commands.server.inviteInfo').addStringOption((o) =>
        describe(o.setName('invite').setRequired(true), 'commands.server.options.invite'),
      ),
    ),
  cooldown: 5,

  async execute(interaction) {
    const handlers = {
      info: serverInfo,
      images: serverImages,
      members: serverMembers,
      'first-message': firstMessage,
      'channel-info': channelInfo,
      'role-info': roleInfo,
      'invite-info': inviteInfo,
    };
    await handlers[interaction.options.getSubcommand()](interaction);
  },
};

const count = (guild, ...types) => guild.channels.cache.filter((c) => types.includes(c.type)).size;

async function serverInfo(interaction) {
  const { guild, t } = interaction;
  const levels = Object.fromEntries(
    Object.entries({
      [GuildVerificationLevel.None]: 'none',
      [GuildVerificationLevel.Low]: 'low',
      [GuildVerificationLevel.Medium]: 'medium',
      [GuildVerificationLevel.High]: 'high',
      [GuildVerificationLevel.VeryHigh]: 'veryHigh',
    }),
  );

  const embed = baseEmbed({ footer: false })
    .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
    .setThumbnail(guild.iconURL())
    .setImage(guild.splashURL({ size: 1024 }))
    .setDescription(
      [
        `❯ **ID:** ${guild.id}`,
        `❯ **${t('server.owner')}:** <@${guild.ownerId}>`,
        `❯ **${t('server.locale')}:** ${guild.preferredLocale}`,
        `❯ **${t('server.created')}:** ${discordTime(guild.createdTimestamp, 'f')}`,
        `❯ **${t('server.members')}:** ${guild.memberCount}`,
      ].join('\n'),
    )
    .addFields(
      {
        name: t('server.channels'),
        value: [
          `❯ **${t('server.text')}:** ${count(guild, ChannelType.GuildText)}`,
          `❯ **${t('server.voice')}:** ${count(guild, ChannelType.GuildVoice)}`,
          `❯ **${t('server.threads')}:** ${count(guild, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread)}`,
          `❯ **${t('server.categories')}:** ${count(guild, ChannelType.GuildCategory)}`,
          `❯ **${t('server.news')}:** ${count(guild, ChannelType.GuildAnnouncement)}`,
          `❯ **${t('server.stage')}:** ${count(guild, ChannelType.GuildStageVoice)}`,
        ].join('\n'),
      },
      {
        name: t('server.emojis'),
        value: [
          `❯ **${t('server.animated')}:** ${guild.emojis.cache.filter((e) => e.animated).size}`,
          `❯ **${t('server.static')}:** ${guild.emojis.cache.filter((e) => !e.animated).size}`,
          `❯ **Stickers:** ${guild.stickers.cache.size}`,
        ].join('\n'),
      },
      {
        name: t('server.details'),
        value: [
          `❯ **${t('server.verification')}:** ${t(`server.levels.${levels[guild.verificationLevel] ?? 'none'}`)}`,
          `❯ **${t('server.boosts')}:** ${guild.premiumSubscriptionCount ?? 0} (${t('server.tier')} ${guild.premiumTier})`,
          `❯ **${t('server.roles')}:** ${guild.roles.cache.size}`,
        ].join('\n'),
      },
    );
  await interaction.reply({ embeds: [embed] });
}

async function serverImages(interaction) {
  const { guild, t } = interaction;
  const type = interaction.options.getString('type', true);
  const url = { banner: guild.bannerURL({ size: 4096 }), icon: guild.iconURL({ size: 4096 }), splash: guild.splashURL({ size: 4096 }) }[type];
  if (!url) return replyError(interaction, t('server.noImage'));
  await interaction.reply({ embeds: [baseEmbed({ footer: false }).setTitle(`${guild.name} · ${type}`).setImage(url).setURL(url)] });
}

async function serverMembers(interaction) {
  const { guild, t } = interaction;
  await interaction.deferReply();
  const members = await guild.members.fetch();
  const humans = members.filter((m) => !m.user.bot);
  const byJoin = [...humans.values()].filter((m) => m.joinedTimestamp).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
  const byAge = [...humans.values()].sort((a, b) => a.user.createdTimestamp - b.user.createdTimestamp);
  const line = (member, time) => `${member} · ${discordTime(time, 'D')}`;

  await interaction.editReply({
    embeds: [
      baseEmbed({ footer: false })
        .setTitle(t('server.membersTitle'))
        .addFields(
          { name: t('server.firstJoined'), value: byJoin[0] ? line(byJoin[0], byJoin[0].joinedTimestamp) : '—' },
          { name: t('server.lastJoined'), value: byJoin.at(-1) ? line(byJoin.at(-1), byJoin.at(-1).joinedTimestamp) : '—' },
          { name: t('server.oldestAccount'), value: byAge[0] ? line(byAge[0], byAge[0].user.createdTimestamp) : '—' },
          { name: t('server.newestAccount'), value: byAge.at(-1) ? line(byAge.at(-1), byAge.at(-1).user.createdTimestamp) : '—' },
        ),
    ],
  });
}

async function firstMessage(interaction) {
  const { t } = interaction;
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  if (!channel.isTextBased()) return replyError(interaction, t('server.notTextChannel'));
  await interaction.deferReply();
  const [first] = (await channel.messages.fetch({ after: '0', limit: 1 }).catch(() => new Map())).values();
  if (!first) return replyError(interaction, t('server.noMessages'));
  await interaction.editReply({
    embeds: [
      baseEmbed({ footer: false })
        .setAuthor({ name: first.author.username, iconURL: first.author.displayAvatarURL() })
        .setTitle(t('server.firstMessage', { channel: channel.name }))
        .setDescription(first.content ? truncate(first.content, 1500) : '—')
        .addFields({ name: t('server.sent'), value: discordTime(first.createdTimestamp, 'f') }, { name: 'Link', value: first.url }),
    ],
  });
}

async function channelInfo(interaction) {
  const { t } = interaction;
  const channel = interaction.options.getChannel('channel', true);
  const lines = [
    `❯ **ID:** ${channel.id}`,
    `❯ **${t('server.type')}:** ${ChannelType[channel.type]}`,
    `❯ **${t('server.created')}:** ${discordTime(channel.createdTimestamp, 'f')}`,
    channel.parent && `❯ **${t('server.category')}:** ${channel.parent.name}`,
    channel.topic && `❯ **${t('server.topic')}:** ${truncate(channel.topic, 300)}`,
    channel.nsfw !== undefined && `❯ **NSFW:** ${channel.nsfw ? '✅' : '❌'}`,
    channel.rateLimitPerUser && `❯ **${t('server.slowmode')}:** ${channel.rateLimitPerUser}s`,
  ].filter(Boolean);
  await interaction.reply({ embeds: [baseEmbed({ footer: false }).setTitle(`#${channel.name}`).setDescription(lines.join('\n'))] });
}

async function roleInfo(interaction) {
  const { t } = interaction;
  const role = interaction.options.getRole('role', true);
  const permissions = role.permissions.toArray().slice(0, 15).map((p) => `\`${p}\``).join(', ') || '—';
  await interaction.reply({
    embeds: [
      baseEmbed({ footer: false })
        .setColor(role.color || 0x2f3136)
        .setTitle(role.name)
        .setDescription(
          [
            `❯ **ID:** ${role.id}`,
            `❯ **${t('server.color')}:** ${role.hexColor}`,
            `❯ **${t('server.created')}:** ${discordTime(role.createdTimestamp, 'f')}`,
            `❯ **${t('server.members')}:** ${role.members.size}`,
            `❯ **${t('server.hoisted')}:** ${role.hoist ? '✅' : '❌'}`,
            `❯ **${t('server.mentionable')}:** ${role.mentionable ? '✅' : '❌'}`,
          ].join('\n'),
        )
        .addFields({ name: t('server.permissions'), value: permissions }),
    ],
    flags: MessageFlags.SuppressNotifications,
  });
}

async function inviteInfo(interaction) {
  const { t } = interaction;
  const code = interaction.options.getString('invite', true).replace(/^.*(?:discord\.gg|discord\.com\/invite)\//i, '').trim();
  const invite = await interaction.client.fetchInvite(code).catch(() => null);
  if (!invite) return replyError(interaction, t('server.inviteInvalid'));

  await interaction.reply({
    embeds: [
      baseEmbed({ footer: false })
        .setTitle(invite.guild?.name ?? code)
        .setThumbnail(invite.guild?.iconURL() ?? null)
        .setDescription(
          [
            `❯ **Code:** ${invite.code}`,
            invite.inviter && `❯ **${t('server.inviter')}:** ${invite.inviter.username}`,
            invite.channel && `❯ **${t('server.channel')}:** #${invite.channel.name}`,
            invite.memberCount != null && `❯ **${t('server.members')}:** ${invite.memberCount} (${invite.presenceCount ?? '?'} online)`,
            invite.expiresTimestamp && `❯ **${t('server.expires')}:** ${discordTime(invite.expiresTimestamp)}`,
          ].filter(Boolean).join('\n'),
        ),
    ],
  });
}
