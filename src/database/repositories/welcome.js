'use strict';

const { getDatabase } = require('../index');

const FIELDS = {
  url: 'url',
  color: 'color',
  message: 'message',
  channelId: 'channel_id',
  style: 'style',
  cardType: 'card_type',
  cardMessage: 'card_message',
  nameColor: 'name_color',
  typeColor: 'type_color',
  messageColor: 'message_color',
  circleBorder: 'circle_border',
};

const toModel = (row) =>
  row && {
    guildId: row.guild_id,
    url: row.url,
    color: row.color,
    message: row.message,
    channelId: row.channel_id,
    style: row.style,
    cardType: row.card_type,
    cardMessage: row.card_message,
    nameColor: row.name_color,
    typeColor: row.type_color,
    messageColor: row.message_color,
    circleBorder: Boolean(row.circle_border),
  };

const get = (guildId) => toModel(getDatabase().prepare('SELECT * FROM welcome WHERE guild_id = ?').get(guildId));

/** Actualiza (o crea) un único campo de la configuración de bienvenida. `value = null` lo borra. */
function setField(guildId, field, value) {
  const column = FIELDS[field];
  if (!column) throw new Error(`Campo de bienvenida inválido: ${field}`);
  const storedValue = field === 'circleBorder' && value !== null ? Number(Boolean(value)) : value;
  getDatabase()
    .prepare(
      `INSERT INTO welcome (guild_id, ${column}) VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET ${column} = excluded.${column}`,
    )
    .run(guildId, storedValue);
}

module.exports = { get, setField };
