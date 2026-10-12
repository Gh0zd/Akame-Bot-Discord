'use strict';

/**
 * Proveedores de GIF gratuitos y sin API key. Cada acción lista sus fuentes por orden de preferencia:
 * si la primera falla se prueba la siguiente.
 */
const PROVIDERS = {
  otaku: (name) => `https://api.otakugifs.xyz/gif?reaction=${name}`,
  waifu: (name) => `https://api.waifu.pics/sfw/${name}`,
};

const o = (name) => ['otaku', name];
const w = (name) => ['waifu', name];

/** counter: lleva la cuenta de veces que cada usuario la recibe (tabla interaction_counts). */
const INTERACTIONS = {
  angry: { sources: [o('angrystare'), o('mad')] },
  baka: { sources: [w('bonk'), o('smack')] },
  bite: { sources: [w('bite'), o('bite')] },
  coffee: { sources: [o('cheers'), o('sip')] },
  cuddle: { sources: [w('cuddle'), o('cuddle')] },
  dance: { sources: [w('dance'), o('dance')] },
  handhold: { sources: [w('handhold'), o('handhold')] },
  hi: { sources: [w('wave'), o('wave')] },
  highfive: { sources: [w('highfive'), o('brofist')] },
  hug: { sources: [w('hug'), o('hug')], counter: true },
  kiss: { sources: [w('kiss'), o('kiss')], counter: true },
  laugh: { sources: [o('laugh'), o('evillaugh')] },
  lick: { sources: [w('lick'), o('lick')] },
  pat: { sources: [w('pat'), o('pat')], counter: true },
  poke: { sources: [w('poke'), o('poke')] },
  punch: { sources: [o('punch'), w('kick')] },
  scared: { sources: [o('scared'), o('sweat')] },
  shy: { sources: [o('shy'), w('blush')] },
  slap: { sources: [w('slap'), o('slap')], counter: true },
  sleep: { sources: [o('sleep'), o('tired')] },
  stare: { sources: [o('stare'), w('cringe')] },
  tickle: { sources: [o('tickle'), o('nuzzle')] },
};

const REACTIONS = {
  clap: { sources: [o('clap'), o('slowclap')] },
  blush: { sources: [w('blush'), o('blush')] },
  boom: { sources: [w('yeet'), o('woah')] },
  bored: { sources: [o('yawn'), o('tired')] },
  confused: { sources: [o('confused'), o('huh')] },
  cry: { sources: [w('cry'), o('cry')] },
  facepalm: { sources: [o('facepalm')] },
  happy: { sources: [w('happy'), o('happy')] },
  like: { sources: [o('thumbsup'), o('yes')] },
  nervous: { sources: [o('nervous'), o('sweat')] },
  nom: { sources: [w('nom'), o('nom')] },
  nope: { sources: [o('no'), o('stop')] },
  pout: { sources: [o('pout')] },
  run: { sources: [o('run')] },
  sad: { sources: [o('sad'), w('cry')] },
  scream: { sources: [o('surprised'), o('woah')] },
  shrug: { sources: [o('shrug')] },
  sip: { sources: [o('sip')] },
  smile: { sources: [w('smile'), o('smile')] },
  smug: { sources: [w('smug'), o('smug')] },
};

/** Devuelve la URL de un GIF probando las fuentes en orden; lanza error si todas fallan. */
async function fetchGif(sources) {
  const axios = require('axios'); // carga diferida: los tests no necesitan la dependencia
  let lastError;
  for (const [provider, name] of sources) {
    try {
      const { data } = await axios.get(PROVIDERS[provider](name), { timeout: 5000 });
      if (typeof data?.url === 'string') return data.url;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('No GIF source returned a URL');
}

module.exports = { INTERACTIONS, REACTIONS, fetchGif };
