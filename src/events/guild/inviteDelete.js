'use strict';

const { Events } = require('discord.js');
const { trackInviteDelete } = require('../../utils/inviteTracker');

module.exports = {
  name: Events.InviteDelete,
  execute: (_client, invite) => trackInviteDelete(invite),
};
