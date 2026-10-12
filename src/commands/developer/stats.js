'use strict';

const os = require('node:os');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { describe } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');

const mb = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

module.exports = {
  data: describe(new SlashCommandBuilder().setName('hoststats'), 'commands.hoststats.description'),
  developerOnly: true,

  async execute(interaction) {
    const memory = process.memoryUsage();
    const [cpu] = os.cpus();
    const rows = [
      ['Total memory', mb(os.totalmem())], ['Used', mb(os.totalmem() - os.freemem())], ['Free', mb(os.freemem())],
      ['RSS', mb(memory.rss)], ['Heap used', mb(memory.heapUsed)], ['Heap total', mb(memory.heapTotal)],
      ['CPU', cpu?.model ?? 'n/a'], ['Cores', os.cpus().length], ['Platform', process.platform], ['PID', process.pid],
    ];
    const text = rows.map(([key, value]) => `${key.padEnd(13)}:: ${value}`).join('\n');
    await interaction.reply({
      embeds: [baseEmbed({ footer: false }).setDescription(`\`\`\`\n${text}\n\`\`\``).setFooter({ text: `Node.js ${process.version}` }).setTimestamp()],
      flags: MessageFlags.Ephemeral,
    });
  },
};
