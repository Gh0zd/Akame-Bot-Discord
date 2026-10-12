'use strict';

const { Events } = require('discord.js');
const { afk } = require('../../database/repositories');
const { resolveLanguage, createTranslator } = require('../../utils/i18n');
const { discordTime } = require('../../utils/format');
const { canSendIn } = require('../../utils/channels');

const AFK_PREFIX = '[AFK] ';
const WELCOME_BACK_DELETE_MS = 7000;

async function clearAuthorAfk(message, entry, t) {
  afk.remove(message.guildId, message.author.id);

  const reply = await message.reply(t('events.afk.welcomeBack', { user: message.author.toString(), since: discordTime(entry.since) })).catch(() => null);
  if (reply) setTimeout(() => reply.delete().catch(() => {}), WELCOME_BACK_DELETE_MS);

  const nickname = message.member?.nickname;
  if (nickname?.startsWith(AFK_PREFIX)) await message.member.setNickname(nickname.slice(AFK_PREFIX.length)).catch(() => {});
}

async function announceMentionedAfk(message, t) {
  if (message.mentions.everyone) return;

  const ids = [...message.mentions.users.values()].filter((user) => !user.bot && user.id !== message.author.id).map((user) => user.id);
  const entries = afk.getMany(message.guildId, ids);
  if (!entries.length) return;

  const lines = entries.map((entry) => t('events.afk.userIsAfk', { user: `<@${entry.user_id}>`, reason: entry.message, since: discordTime(entry.since) }));
  await message.reply({ content: lines.join('\n\n'), allowedMentions: { parse: [] } }).catch(() => {});
}

module.exports = {
  name: Events.MessageCreate,
  async execute(_client, message) {
    if (message.author.bot || message.system || message.webhookId || !message.inGuild()) return;
    if (!canSendIn(message.channel)) return;

    const t = createTranslator(resolveLanguage({ guildId: message.guildId }));
    const entry = afk.get(message.guildId, message.author.id);
    if (entry) await clearAuthorAfk(message, entry, t);
    await announceMentionedAfk(message, t);
  },
};
