'use strict';

const config = require('../config');
const { baseEmbed } = require('./embeds');
const { sendToChannel } = require('./channelLog');
const { discordTime } = require('./format');

/** Envía al canal de logs un embed con los datos del servidor al que el bot entra o del que sale. */
async function logGuildChange(client, guild, joined) {
  if (!guild?.available) return;

  const owner = await guild
    .fetchOwner()
    .then((member) => `${member.user.username} (${member.id})`)
    .catch(() => guild.ownerId);

  const embed = baseEmbed({ footer: false, color: joined ? config.colors.success : config.colors.error })
    .setTitle(joined ? '📥 Joined a server' : '📤 Left a server')
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: 'Server', value: `${guild.name}\n\`${guild.id}\``, inline: true },
      { name: 'Owner', value: owner, inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Created', value: discordTime(guild.createdTimestamp), inline: true },
      { name: 'Total servers', value: `${client.guilds.cache.size}`, inline: true },
    )
    .setTimestamp();

  await sendToChannel(client, config.channels.server, { embeds: [embed] });
}

module.exports = { logGuildChange };
