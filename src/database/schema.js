'use strict';

/**
 * Migraciones incrementales. Cada elemento se ejecuta una sola vez
 * y el número de versión se guarda en `PRAGMA user_version`.
 */
module.exports = [
  `
  CREATE TABLE guild_settings (
    guild_id TEXT PRIMARY KEY,
    language TEXT
  );

  CREATE TABLE user_settings (
    user_id  TEXT PRIMARY KEY,
    language TEXT
  );

  CREATE TABLE afk (
    guild_id TEXT NOT NULL,
    user_id  TEXT NOT NULL,
    message  TEXT NOT NULL,
    since    INTEGER NOT NULL,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE badges (
    user_id TEXT PRIMARY KEY,
    flags   TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE premium (
    id          TEXT PRIMARY KEY,
    is_premium  INTEGER NOT NULL DEFAULT 0,
    redeemed_by TEXT NOT NULL DEFAULT '[]',
    redeemed_at INTEGER,
    expires_at  INTEGER,
    plan        TEXT
  );
  CREATE INDEX idx_premium_active ON premium (is_premium, expires_at);

  CREATE TABLE redeem_codes (
    code       TEXT PRIMARY KEY,
    plan       TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE user_blacklist (
    user_id TEXT PRIMARY KEY,
    reason  TEXT NOT NULL,
    time    INTEGER NOT NULL
  );

  CREATE TABLE guild_blacklist (
    guild_id TEXT PRIMARY KEY,
    reason   TEXT NOT NULL,
    time     INTEGER NOT NULL
  );

  CREATE TABLE welcome (
    guild_id   TEXT PRIMARY KEY,
    url        TEXT,
    color      TEXT,
    message    TEXT,
    channel_id TEXT
  );

  CREATE TABLE features (
    guild_id           TEXT PRIMARY KEY,
    logs               INTEGER NOT NULL DEFAULT 0,
    captcha_system     INTEGER NOT NULL DEFAULT 0,
    confession_system  INTEGER NOT NULL DEFAULT 0,
    ping_join          INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE poj_system (
    guild_id    TEXT PRIMARY KEY,
    role_id     TEXT,
    channel_ids TEXT NOT NULL DEFAULT '[]',
    message     TEXT
  );

  CREATE TABLE profiles (
    user_id        TEXT PRIMARY KEY,
    played_count   INTEGER NOT NULL DEFAULT 0,
    use_count      INTEGER NOT NULL DEFAULT 0,
    listen_time    INTEGER NOT NULL DEFAULT 0,
    played_history TEXT NOT NULL DEFAULT '[]'
  );

  -- Sustituye a hugSchema, kissSchema, patSchema, slapSchema y mamadaSchema.
  CREATE TABLE interaction_counts (
    user_id   TEXT NOT NULL,
    action    TEXT NOT NULL,
    target_id TEXT NOT NULL DEFAULT '',
    count     INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, action, target_id)
  );
  `,
  `
  ALTER TABLE welcome ADD COLUMN style TEXT NOT NULL DEFAULT 'minimal';
  ALTER TABLE welcome ADD COLUMN card_type TEXT;
  ALTER TABLE welcome ADD COLUMN card_message TEXT;
  ALTER TABLE welcome ADD COLUMN name_color TEXT;
  ALTER TABLE welcome ADD COLUMN type_color TEXT;
  ALTER TABLE welcome ADD COLUMN message_color TEXT;
  ALTER TABLE welcome ADD COLUMN circle_border INTEGER NOT NULL DEFAULT 0;
  `,
];
