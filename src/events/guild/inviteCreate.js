'use strict';

const { Events } = require('discord.js');
const { trackInviteCreate } = require('../../utils/inviteTracker');

module.exports = {
  name: Events.InviteCreate,
  execute: (_client, invite) => trackInviteCreate(invite),
};
