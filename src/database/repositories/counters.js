'use strict';

const { getDatabase } = require('../index');

/** Incrementa un contador (hug, kiss, pat, slap…) y devuelve el nuevo valor. */
function increment(userId, action, targetId = '') {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO interaction_counts (user_id, action, target_id, count) VALUES (?, ?, ?, 1)
     ON CONFLICT(user_id, action, target_id) DO UPDATE SET count = count + 1`,
  ).run(userId, action, targetId);
  return db
    .prepare('SELECT count FROM interaction_counts WHERE user_id = ? AND action = ? AND target_id = ?')
    .get(userId, action, targetId).count;
}

function total(userId, action) {
  return (
    getDatabase()
      .prepare('SELECT COALESCE(SUM(count), 0) AS total FROM interaction_counts WHERE user_id = ? AND action = ?')
      .get(userId, action).total
  );
}

module.exports = { increment, total };
