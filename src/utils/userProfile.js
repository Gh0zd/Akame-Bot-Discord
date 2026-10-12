'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const { baseEmbed } = require('./embeds');
const { badges } = require('../database/repositories');
const { discordTime } = require('./format');
const { permissionName } = require('./permissions');

const CUSTOM_BADGES = {
  DEVELOPER: '💻', EVENT: '🎉', BOOSTER: '✨', BUGS: '🐛', MANAGEMENT: '🛠️', PREMIUM: '💎', SUPPORTER: '💖',
  TEAM: '👥', PARTNER: '🤝', VOTER: '🗳️', SUPPORT: '🆘', MODERATOR: '👮', DESIGNER: '🎨', MARKETING: '📈',
  ACTIVE: '🏃', VIP: '👑',
};
const BADGE_NAMES = Object.keys(CUSTOM_BADGES);

const DISCORD_FLAG_EMOJIS = {
  Staff: '<:discord_staff:1037491047133102100>',
  Partner: '<:discord_partner:1037490808254890106>',
  HypeSquadOnlineHouse1: '<:hypesquad_bravery:1037415854175957022>',
  HypeSquadOnlineHouse2: '<:hypesquad_brilliance:1037481410375716875>',
  HypeSquadOnlineHouse3: '<:hypesquad_balance:1037481784092393502>',
  PremiumEarlySupporter: '<:early_supporter:1037482060270538913>',
  VerifiedBot: '<:verified_bot:1037483457409982655>',
  VerifiedDeveloper: '<:early_verified_bot_developer:1037487612115570739>',
};

const AVATAR_SIZES = [128, 256, 512, 1024, 2048, 4096];

function collectBadges(user) {
  const discord = (user.flags?.toArray() ?? []).map((flag) => DISCORD_FLAG_EMOJIS[flag]).filter(Boolean);
  const custom = badges.getFlags(user.id).map((flag) => CUSTOM_BADGES[flag]).filter(Boolean);
  return [...discord, ...custom].join(' ');
}

/** Embed con los datos de un usuario (y de su membresía en el servidor si existe). */
async function userInfoEmbed(interaction, user, member) {
  const t = interaction.t;
  const fetched = await user.fetch().catch(() => user); // necesario para banner / color
  const roles = member ? [...member.roles.cache.values()].filter((role) => role.id !== interaction.guildId).sort((a, b) => b.position - a.position) : [];

  const lines = [
    `❯ **${t('common.user')}:** ${user} (\`${user.id}\`)`,
    `❯ **${t('userinfo.created')}:** ${discordTime(user.createdTimestamp, 'f')} (${discordTime(user.createdTimestamp)})`,
    member?.joinedTimestamp && `❯ **${t('userinfo.joined')}:** ${discordTime(member.joinedTimestamp, 'f')} (${discordTime(member.joinedTimestamp)})`,
    member?.premiumSince && `❯ **${t('userinfo.boosting')}:** ${discordTime(member.premiumSinceTimestamp)}`,
    `❯ **${t('userinfo.bot')}:** ${user.bot ? '✅' : '❌'}`,
  ].filter(Boolean);

  const embed = baseEmbed({ footer: false })
    .setColor(member?.displayColor || fetched.accentColor || 0x2f3136)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setThumbnail(user.displayAvatarURL({ size: 512 }))
    .setDescription(lines.join('\n'))
    .setTimestamp();

  const userBadges = collectBadges(user);
  if (userBadges) embed.addFields({ name: t('userinfo.badges'), value: userBadges });
  if (roles.length) {
    const shown = roles.slice(0, 15).join(' ');
    embed.addFields({ name: t('userinfo.roles', { count: roles.length }), value: roles.length > 15 ? `${shown} …` : shown });
  }
  if (fetched.bannerURL()) embed.setImage(fetched.bannerURL({ size: 1024 }));
  return embed;
}

/** Mensaje de avatar con menú de tamaños y botones de descarga. */
function avatarPayload(interaction, user) {
  const t = interaction.t;
  const url = user.displayAvatarURL({ size: 2048 });
  const formats = ['png', 'jpg', 'webp', ...(user.avatar?.startsWith('a_') ? ['gif'] : [])];

  const embed = baseEmbed({ footer: false })
    .setAuthor({ name: t('userinfo.avatarOf', { user: user.username }) })
    .setDescription(t('userinfo.avatarHint'))
    .setImage(url);

  const links = new ActionRowBuilder().addComponents(
    formats.map((extension) =>
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(extension.toUpperCase()).setURL(user.displayAvatarURL({ extension, size: 2048 })),
    ),
  );
  const sizes = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`avatar_size:${user.id}`)
      .setPlaceholder(t('userinfo.chooseSize'))
      .addOptions(AVATAR_SIZES.map((size) => ({ label: `${size}px`, value: String(size) }))),
  );
  return { embeds: [embed], components: [sizes, links] };
}

/** Devuelve el payload del banner o `null` si el usuario no tiene. */
async function bannerPayload(interaction, user) {
  const fetched = await user.fetch(true);
  const url = fetched.bannerURL({ size: 4096 });
  if (!url) return null;
  const embed = baseEmbed({ footer: false })
    .setAuthor({ name: interaction.t('userinfo.bannerOf', { user: user.username }), iconURL: user.displayAvatarURL() })
    .setImage(url);
  const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Download').setURL(url));
  return { embeds: [embed], components: [row] };
}

/** Lista de permisos del usuario en el canal actual. */
function permissionsEmbed(interaction, user, member) {
  const t = interaction.t;
  const permissions = interaction.channel.permissionsFor(member);
  const all = Object.keys(PermissionsBitField.Flags);
  const lines = all.map((name) => `${permissions.has(name) ? '✅' : '❌'} ${permissionName(interaction.lang, name)}`);
  const half = Math.ceil(lines.length / 2);
  return baseEmbed({ footer: false })
    .setTitle(t('userinfo.permissionsOf', { user: user.username }))
    .addFields(
      { name: '\u200b', value: lines.slice(0, half).join('\n'), inline: true },
      { name: '\u200b', value: lines.slice(half).join('\n'), inline: true },
    );
}

module.exports = { userInfoEmbed, avatarPayload, bannerPayload, permissionsEmbed, BADGE_NAMES, AVATAR_SIZES };
