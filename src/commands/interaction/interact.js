'use strict';

const { createReactionCommand } = require('../../utils/reactionCommand');
const { INTERACTIONS } = require('../../utils/gifActions');

module.exports = createReactionCommand('interact', INTERACTIONS);
