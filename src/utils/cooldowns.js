'use strict';

const timestamps = new Map(); // `${command}:${user}` -> instante de expiración (ms)

/** Devuelve los segundos restantes si el usuario sigue en cooldown; si no, registra el uso y devuelve 0. */
function check(commandName, userId, seconds) {
  if (!seconds) return 0;

  const key = `${commandName}:${userId}`;
  const now = Date.now();
  const expiresAt = timestamps.get(key) ?? 0;

  if (expiresAt > now) return (expiresAt - now) / 1000;

  timestamps.set(key, now + seconds * 1000);
  return 0;
}

// Limpieza periódica de entradas vencidas (evita que el Map crezca indefinidamente).
setInterval(() => {
  const now = Date.now();
  for (const [key, expiresAt] of timestamps) if (expiresAt <= now) timestamps.delete(key);
}, 60_000).unref();

module.exports = { check };
