'use strict';

const words = require('./forbiddenWords.json');

const singles = new Set(words.filter((word) => !/\s/.test(word)));
const phrases = words.filter((word) => /\s/.test(word));

/** `true` si el texto contiene alguna palabra o frase prohibida (comparación por palabra completa). */
function hasForbiddenWords(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  const tokens = lower.split(/[^\p{L}\p{N}]+/u);
  return tokens.some((token) => singles.has(token)) || phrases.some((phrase) => lower.includes(phrase));
}

module.exports = { hasForbiddenWords };
