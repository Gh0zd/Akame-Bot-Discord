'use strict';

const { getDatabase } = require('../index');

function getFlags(userId) {
  const row = getDatabase().prepare('SELECT flags FROM badges WHERE user_id = ?').get(userId);
  return row ? JSON.parse(row.flags) : [];
}

function saveFlags(userId, flags) {
  getDatabase()
    .prepare(
      `INSERT INTO badges (user_id, flags) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET flags = excluded.flags`,
    )
    .run(userId, JSON.stringify(flags));
}

/** Añade o quita una insignia. Devuelve `false` si no había nada que cambiar. */
function toggle(userId, badge, enabled) {
  const flags = getFlags(userId);
  const has = flags.includes(badge);
  if (enabled === has) return false;
  saveFlags(userId, enabled ? [...flags, badge] : flags.filter((flag) => flag !== badge));
  return true;
}

module.exports = { getFlags, toggle };
