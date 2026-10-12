'use strict';

const { PermissionFlagsBits } = require('discord.js');

/** `true` si el bot puede ver y escribir en el canal (o hilo) indicado. */
function canSendIn(channel) {
  const me = channel.guild?.members.me;
  if (!me || !channel.isTextBased()) return false;
  const permissions = channel.permissionsFor(me);
  if (!permissions) return false;
  const sendFlag = channel.isThread() ? PermissionFlagsBits.SendMessagesInThreads : PermissionFlagsBits.SendMessages;
  return permissions.has([PermissionFlagsBits.ViewChannel, sendFlag]);
}

module.exports = { canSendIn };
