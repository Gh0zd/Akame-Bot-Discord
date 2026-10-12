'use strict';

const { getDatabase } = require('../index');

const COLUMNS = {
  logs: 'logs',
  captchaSystem: 'captcha_system',
  confessionSystem: 'confession_system',
  pingJoin: 'ping_join',
};

function getFeatures(guildId) {
  const row = getDatabase().prepare('SELECT * FROM features WHERE guild_id = ?').get(guildId);
  return {
    logs: Boolean(row?.logs),
    captchaSystem: Boolean(row?.captcha_system),
    confessionSystem: Boolean(row?.confession_system),
    pingJoin: Boolean(row?.ping_join),
  };
}

function setFeature(guildId, feature, enabled) {
  const column = COLUMNS[feature];
  if (!column) throw new Error(`Feature inválida: ${feature}`);
  getDatabase()
    .prepare(
      `INSERT INTO features (guild_id, ${column}) VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET ${column} = excluded.${column}`,
    )
    .run(guildId, enabled ? 1 : 0);
}

function getPingOnJoin(guildId) {
  const row = getDatabase().prepare('SELECT * FROM poj_system WHERE guild_id = ?').get(guildId);
  return row && { guildId, roleId: row.role_id, channelIds: JSON.parse(row.channel_ids), message: row.message };
}

function setPingOnJoin(guildId, { roleId = null, channelIds = [], message = null }) {
  getDatabase()
    .prepare(
      `INSERT INTO poj_system (guild_id, role_id, channel_ids, message) VALUES (?, ?, ?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET
         role_id = excluded.role_id, channel_ids = excluded.channel_ids, message = excluded.message`,
    )
    .run(guildId, roleId, JSON.stringify(channelIds), message);
}

module.exports = { getFeatures, setFeature, getPingOnJoin, setPingOnJoin };
