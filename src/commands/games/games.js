'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Slots, TwoZeroFourEight, Hangman, RockPaperScissors, Flood, Snake, TicTacToe, FindEmoji, Minesweeper, Connect4 } = require('discord-gamecord');
const { describe } = require('../../utils/localize');
const config = require('../../config');

/**
 * Juegos de discord-gamecord. `versus: true` añade la opción `user` (rival).
 * `options(t, interaction)` aporta los textos ya traducidos.
 */
const GAMES = {
  slots: { Game: Slots, options: () => ({ slots: ['🍇', '🍊', '🍋', '🍌'] }) },
  '2048': { Game: TwoZeroFourEight, options: () => ({ emojis: { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' } }) },
  hangman: {
    Game: Hangman,
    options: (t) => ({
      hangman: { hat: '🎩', head: '😟', shirt: '👕', pants: '🩳', boots: '👞👞' },
      theme: 'discord',
      winMessage: t('commands.games.hangmanWin'),
      loseMessage: t('commands.games.hangmanLose'),
    }),
  },
  mines: { Game: Minesweeper, options: () => ({ mines: 5 }) },
  findemoji: { Game: FindEmoji, options: () => ({}) },
  flood: { Game: Flood, options: () => ({}) },
  snake: { Game: Snake, options: () => ({}) },
  rps: { Game: RockPaperScissors, versus: true, options: () => ({ mentionUser: true }) },
  tictactoe: { Game: TicTacToe, versus: true, options: () => ({}) },
  connect4: { Game: Connect4, versus: true, options: () => ({}) },
};

const data = describe(new SlashCommandBuilder().setName('games'), 'commands.games.description');
for (const [name, { versus }] of Object.entries(GAMES)) {
  data.addSubcommand((sub) => {
    describe(sub.setName(name), `commands.games.${name}`);
    return versus ? sub.addUserOption((o) => describe(o.setName('user').setRequired(true), 'commands.games.options.opponent')) : sub;
  });
}

module.exports = {
  data,
  cooldown: 5,

  async execute(interaction) {
    const t = interaction.t;
    const name = interaction.options.getSubcommand();
    const { Game, versus, options } = GAMES[name];

    const opponent = versus ? interaction.options.getUser('user', true) : null;
    if (opponent && (opponent.bot || opponent.id === interaction.user.id)) {
      return interaction.reply({ content: t('commands.games.invalidOpponent'), flags: MessageFlags.Ephemeral });
    }

    const game = new Game({
      message: interaction,
      isSlashGame: true,
      embed: { title: name, color: config.colors.main },
      timeoutTime: 60_000,
      playerOnlyMessage: t('commands.games.playerOnly'),
      ...(opponent && { opponent }),
      ...options(t, interaction),
    });
    await game.startGame();
  },
};
