'use strict';

const { getDatabase } = require('../index');

// Caché de idiomas: evita una consulta por cada interacción.
const guildLang = new Map();
const userLang = new Map();

const fromCache = (cache, key, query) => {
  if (cache.has(key)) return cache.get(key);
  const value = query() ?? null;
  cache.set(key, value);
  return value;
};

function getGuildLanguage(guildId) {
  if (!guildId) return null;
  return fromCache(guildLang, guildId, () =>
    getDatabase().prepare('SELECT language FROM guild_settings WHERE guild_id = ?').get(guildId)?.language,
  );
}

function setGuildLanguage(guildId, language) {
  getDatabase()
    .prepare(
      `INSERT INTO guild_settings (guild_id, language) VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET language = excluded.language`,
    )
    .run(guildId, language);
  guildLang.set(guildId, language);
}

function getUserLanguage(userId) {
  return fromCache(userLang, userId, () =>
    getDatabase().prepare('SELECT language FROM user_settings WHERE user_id = ?').get(userId)?.language,
  );
}

function setUserLanguage(userId, language) {
  getDatabase()
    .prepare(
      `INSERT INTO user_settings (user_id, language) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET language = excluded.language`,
    )
    .run(userId, language);
  userLang.set(userId, language);
}

function clearUserLanguage(userId) {
  getDatabase().prepare('DELETE FROM user_settings WHERE user_id = ?').run(userId);
  userLang.set(userId, null);
}

function clearGuildLanguage(guildId) {
  getDatabase().prepare('DELETE FROM guild_settings WHERE guild_id = ?').run(guildId);
  guildLang.set(guildId, null);
}

module.exports = {
  getGuildLanguage,
  setGuildLanguage,
  clearGuildLanguage,
  getUserLanguage,
  setUserLanguage,
  clearUserLanguage,
};
