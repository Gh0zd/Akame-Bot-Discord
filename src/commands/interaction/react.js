'use strict';

const { createReactionCommand } = require('../../utils/reactionCommand');
const { REACTIONS } = require('../../utils/gifActions');

module.exports = createReactionCommand('react', REACTIONS);
