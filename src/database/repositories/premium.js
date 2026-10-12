'use strict';

const { getDatabase } = require('../index');

const DAY = 86_400_000;
const PLANS = {
  daily: DAY,
  weekly: DAY * 7,
  monthly: DAY * 30,
  yearly: DAY * 365,
  lifetime: DAY * 365 * 100,
};

const toModel = (row) =>
  row && {
    id: row.id,
    isPremium: Boolean(row.is_premium),
    redeemedBy: JSON.parse(row.redeemed_by),
    redeemedAt: row.redeemed_at,
    expiresAt: row.expires_at,
    plan: row.plan,
  };

const get = (id) => toModel(getDatabase().prepare('SELECT * FROM premium WHERE id = ?').get(id));

/** `true` si la entidad (usuario o servidor) tiene premium vigente. */
function isActive(id) {
  const row = getDatabase().prepare('SELECT is_premium, expires_at FROM premium WHERE id = ?').get(id);
  return Boolean(row?.is_premium) && (row.expires_at ?? 0) > Date.now();
}

/** Genera `amount` códigos únicos con el patrón recibido. Devuelve los códigos creados. */
function createCodes(plan, amount, generateCode) {
  if (!PLANS[plan]) throw new Error(`Plan inválido: ${plan}`);
  const expiresAt = Date.now() + PLANS[plan];
  const insert = getDatabase().prepare('INSERT OR IGNORE INTO redeem_codes (code, plan, expires_at) VALUES (?, ?, ?)');
  const created = [];
  for (let i = 0; i < amount; i++) {
    const code = generateCode();
    if (insert.run(code, plan, expiresAt).changes) created.push(code);
  }
  return { codes: created, expiresAt };
}

/**
 * Canjea un código para `id`. Devuelve:
 *  - { status: 'already' }         si ya tiene premium
 *  - { status: 'invalid' }         si el código no existe
 *  - { status: 'ok', expiresAt }   si se canjeó correctamente
 */
function redeem(id, redeemer, rawCode) {
  const db = getDatabase();
  return db.transaction(() => {
    if (isActive(id)) return { status: 'already' };

    const code = db.prepare('SELECT * FROM redeem_codes WHERE code = ?').get(String(rawCode).toUpperCase());
    if (!code) return { status: 'invalid' };

    const previous = get(id);
    const redeemedBy = [...(previous?.redeemedBy ?? []), redeemer];
    db.prepare(
      `INSERT INTO premium (id, is_premium, redeemed_by, redeemed_at, expires_at, plan)
       VALUES (?, 1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         is_premium = 1, redeemed_by = excluded.redeemed_by, redeemed_at = excluded.redeemed_at,
         expires_at = excluded.expires_at, plan = excluded.plan`,
    ).run(id, JSON.stringify(redeemedBy), Date.now(), code.expires_at, code.plan);
    db.prepare('DELETE FROM redeem_codes WHERE code = ?').run(code.code);

    return { status: 'ok', expiresAt: code.expires_at, plan: code.plan };
  })();
}

/** Desactiva los premium vencidos. Devuelve cuántos expiraron. */
function expireOutdated() {
  return getDatabase()
    .prepare(
      `UPDATE premium
          SET is_premium = 0, redeemed_by = '[]', redeemed_at = NULL, expires_at = NULL, plan = NULL
        WHERE is_premium = 1 AND expires_at <= ?`,
    )
    .run(Date.now()).changes;
}

module.exports = { PLANS, get, isActive, createCodes, redeem, expireOutdated };
