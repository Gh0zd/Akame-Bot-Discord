'use strict';

/** Seguimiento de invitaciones: compara los usos antes y después de que un miembro entre. */
const cache = new Map(); // guildId -> Map<code, { uses, inviter }>

const snapshot = (invites) => new Map(invites.map((invite) => [invite.code, { uses: invite.uses ?? 0, inviter: invite.inviter ?? null }]));

async function cacheGuildInvites(guild) {
  try {
    cache.set(guild.id, snapshot(await guild.invites.fetch()));
    return true;
  } catch {
    return false; // sin permiso ManageGuild
  }
}

/** Devuelve { inviter, uses } de la invitación usada por el último miembro, o null si no se puede determinar. */
async function findUsedInvite(guild) {
  const before = cache.get(guild.id);
  if (!before) return null;

  try {
    const invites = await guild.invites.fetch();
    const used = invites.find((invite) => (invite.uses ?? 0) > (before.get(invite.code)?.uses ?? 0));
    cache.set(guild.id, snapshot(invites));
    return used ? { inviter: used.inviter ?? null, uses: used.uses ?? 0 } : null;
  } catch {
    return null;
  }
}

const trackInviteCreate = (invite) => cache.get(invite.guild?.id)?.set(invite.code, { uses: invite.uses ?? 0, inviter: invite.inviter ?? null });
const trackInviteDelete = (invite) => cache.get(invite.guild?.id)?.delete(invite.code);

module.exports = { cacheGuildInvites, findUsedInvite, trackInviteCreate, trackInviteDelete };
