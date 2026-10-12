'use strict';

const { getDatabase } = require('../index');

const get = (guildId, userId) =>
  getDatabase().prepare('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

const set = (guildId, userId, message) =>
  getDatabase()
    .prepare('INSERT OR REPLACE INTO afk (guild_id, user_id, message, since) VALUES (?, ?, ?, ?)')
    .run(guildId, userId, message, Date.now());

const remove = (guildId, userId) =>
  getDatabase().prepare('DELETE FROM afk WHERE guild_id = ? AND user_id = ?').run(guildId, userId);

/** Devuelve las filas AFK de varios usuarios de una vez (una sola consulta). */
function getMany(guildId, userIds) {
  if (!userIds.length) return [];
  const placeholders = userIds.map(() => '?').join(',');
  return getDatabase()
    .prepare(`SELECT * FROM afk WHERE guild_id = ? AND user_id IN (${placeholders})`)
    .all(guildId, ...userIds);
}

module.exports = { get, set, remove, getMany };
