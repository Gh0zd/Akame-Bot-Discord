'use strict';

const { Client, GatewayIntentBits, Options, Collection } = require('discord.js');

function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers, // privilegiado: bienvenidas / ping al entrar
      GatewayIntentBits.GuildInvites, // seguimiento de invitaciones
      GatewayIntentBits.GuildMessages, // AFK y respuesta a menciones (no requiere MessageContent)
    ],
    allowedMentions: { parse: ['users'], repliedUser: false },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 20,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      GuildBanManager: 0,
      GuildStickerManager: 0,
      GuildScheduledEventManager: 0,
      GuildMemberManager: { maxSize: 200, keepOverLimit: (member) => member.id === member.client.user.id },
    }),
    sweepers: {
      ...Options.DefaultSweeperSettings,
      messages: { interval: 3600, lifetime: 1800 },
      users: { interval: 3600, filter: () => (user) => user.bot && user.id !== user.client.user.id },
    },
  });

  client.commands = new Collection();
  client.components = [];
  return client;
}

module.exports = { createClient };
