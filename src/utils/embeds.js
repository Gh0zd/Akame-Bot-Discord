'use strict';

const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/** Embed base con el color y el footer del bot. */
function baseEmbed({ footer = true, color = config.colors.main } = {}) {
  const embed = new EmbedBuilder().setColor(color);
  if (footer) embed.setFooter({ text: config.footer.text, iconURL: config.footer.icon });
  return embed;
}

const errorEmbed = (description) => new EmbedBuilder().setColor(config.colors.error).setDescription(`❌ ${description}`);
const successEmbed = (description) => new EmbedBuilder().setColor(config.colors.success).setDescription(`✅ ${description}`);

module.exports = { baseEmbed, errorEmbed, successEmbed };
