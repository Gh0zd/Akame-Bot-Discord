'use strict';

require('dotenv').config();

const SUPPORTED_LANGUAGES = ['en', 'es', 'pt'];

const list = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const bool = (value, fallback = false) =>
  value === undefined || value === '' ? fallback : ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

const clientId = process.env.CLIENT_ID;
const logChannel = process.env.LOG_CHANNEL_ID || null;
const pick = (key) => process.env[key] || logChannel;

const defaultLanguage = SUPPORTED_LANGUAGES.includes(process.env.DEFAULT_LANGUAGE)
  ? process.env.DEFAULT_LANGUAGE
  : 'es';

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId,
  ownerIds: list(process.env.OWNER_IDS),
  supportGuildId: process.env.SUPPORT_GUILD_ID || null,
  slashGlobal: bool(process.env.SLASH_GLOBAL, true),
  commandLogs: bool(process.env.COMMAND_LOGS, true),
  autoDeploy: bool(process.env.AUTO_DEPLOY, false),
  enableEval: bool(process.env.ENABLE_EVAL, false),
  defaultLanguage,
  supportedLanguages: SUPPORTED_LANGUAGES,
  databasePath: process.env.DATABASE_PATH || './data/akame.sqlite',
  links: {
    support: process.env.SUPPORT_URL || 'https://discord.gg/dGB9fJ3azu',
    invite:
      process.env.BOT_INVITE_URL ||
      `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${
        process.env.BOT_INVITE_PERMISSIONS || '534723820736'
      }&scope=bot%20applications.commands`,
  },
  channels: {
    log: logChannel,
    server: pick('SERVER_LOG_CHANNEL_ID'),
    command: pick('COMMAND_LOG_CHANNEL_ID'),
    error: pick('ERROR_LOG_CHANNEL_ID'),
    report: pick('REPORT_CHANNEL_ID'),
    bug: pick('BUG_CHANNEL_ID'),
    suggestion: pick('SUGGESTION_CHANNEL_ID'),
  },
  colors: {
    main: '#2f3136',
    success: '#57f287',
    warning: '#fee75c',
    error: '#ed4245',
  },
  footer: {
    text: 'Powered by Akame',
    icon: 'https://cdn.discordapp.com/emojis/994612386713575534.gif?size=32&quality=lossless',
  },
};

/** Valida las variables imprescindibles. Lanza un Error con la lista de las que faltan. */
config.validate = () => {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 22) {
    throw new Error(`Akame requiere Node.js 22 o superior. Versión actual: ${process.versions.node}`);
  }

  const missing = [];
  if (!config.token) missing.push('DISCORD_TOKEN');
  if (!config.clientId) missing.push('CLIENT_ID');
  if (!config.ownerIds.length) missing.push('OWNER_IDS');
  if (!config.slashGlobal && !config.supportGuildId) missing.push('SUPPORT_GUILD_ID (requerido si SLASH_GLOBAL=false)');
  if (missing.length) throw new Error(`Faltan variables de entorno: ${missing.join(', ')}. Revisa tu archivo .env`);
};

module.exports = config;
