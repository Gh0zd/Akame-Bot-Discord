'use strict';

const { getDatabase } = require('../index');

const TABLES = {
  user: { table: 'user_blacklist', column: 'user_id' },
  guild: { table: 'guild_blacklist', column: 'guild_id' },
};

const meta = (kind) => {
  const entry = TABLES[kind];
  if (!entry) throw new Error(`Tipo de blacklist inválido: ${kind}`);
  return entry;
};

function get(kind, id) {
  const { table, column } = meta(kind);
  return getDatabase().prepare(`SELECT * FROM ${table} WHERE ${column} = ?`).get(id);
}

function add(kind, id, reason) {
  const { table, column } = meta(kind);
  getDatabase()
    .prepare(`INSERT OR REPLACE INTO ${table} (${column}, reason, time) VALUES (?, ?, ?)`)
    .run(id, reason, Date.now());
}

function remove(kind, id) {
  const { table, column } = meta(kind);
  return getDatabase().prepare(`DELETE FROM ${table} WHERE ${column} = ?`).run(id).changes > 0;
}

module.exports = { get, add, remove };
