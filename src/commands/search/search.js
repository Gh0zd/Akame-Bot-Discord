'use strict';

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const weather = require('weather-js');
const { describe, rename } = require('../../utils/localize');
const { baseEmbed } = require('../../utils/embeds');
const { replyError } = require('../../utils/respond');
const { capitalize, truncate } = require('../../utils/format');

const http = axios.create({ timeout: 10_000 });
const findWeather = (options) =>
  new Promise((resolve, reject) => {
    weather.find(options, (error, results) => (error ? reject(error) : resolve(results)));
  });

const stringOption = (key, name) => (o) => describe(o.setName(name).setRequired(true), key);

/** Cada búsqueda recibe (interaction, query) y devuelve un EmbedBuilder, o null si no hay resultados. */
const searches = {
  async lyrics(interaction, query) {
    const { data } = await http.get('https://lrclib.net/api/search', { params: { q: query } });
    const result = data?.find((track) => track.plainLyrics || track.syncedLyrics);
    const lyrics = result?.plainLyrics || result?.syncedLyrics;
    if (!lyrics) return null;
    const title = result.name || [result.artistName, result.trackName].filter(Boolean).join(' - ') || query;
    return baseEmbed({ footer: false })
      .setTitle(truncate(title, 250))
      .setDescription(truncate(lyrics, 4000));
  },

  async pokemon(interaction, query) {
    const { data } = await http.get(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query.toLowerCase())}`);
    const t = interaction.t;
    return baseEmbed({ footer: false })
      .setColor('Red')
      .setTitle(`${capitalize(data.name)} #${data.id}`)
      .setThumbnail(data.sprites.front_default)
      .addFields(
        { name: t('search.pokemon.baseExp'), value: `${data.base_experience ?? 'N/A'}`, inline: true },
        { name: t('search.pokemon.weight'), value: `${data.weight / 10} kg`, inline: true },
        { name: t('search.pokemon.height'), value: `${data.height / 10} m`, inline: true },
        { name: t('search.pokemon.types'), value: data.types.map((x) => capitalize(x.type.name)).join(', ') },
        { name: t('search.pokemon.abilities'), value: data.abilities.map((x) => capitalize(x.ability.name)).join(', ') },
        ...data.stats.map((x) => ({ name: capitalize(x.stat.name), value: `${x.base_stat}`, inline: true })),
      );
  },

  async urban(interaction, query) {
    const { data } = await http.get('https://api.urbandictionary.com/v0/define', { params: { term: query } });
    const entry = data.list?.[0];
    if (!entry) return null;
    const t = interaction.t;
    return baseEmbed({ footer: false })
      .setColor('Green')
      .setTitle(entry.word)
      .setURL(entry.permalink)
      .addFields(
        { name: t('search.urban.definition'), value: truncate(entry.definition, 1024) },
        { name: t('search.urban.example'), value: truncate(entry.example || '—', 1024) },
        { name: t('search.urban.ratings'), value: `👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down}` },
      );
  },

  async weather(interaction, query) {
    const [result] = (await findWeather({ search: query, degreeType: 'C' })) ?? [];
    if (!result) return null;
    const { current } = result;
    const t = interaction.t;
    return baseEmbed({ footer: false })
      .setColor('Blue')
      .setTitle(t('search.weather.title', { place: current.observationpoint }))
      .setDescription(current.skytext)
      .setThumbnail(current.imageUrl)
      .addFields(
        { name: t('search.weather.temperature'), value: `${current.temperature}°C`, inline: true },
        { name: t('search.weather.feelsLike'), value: `${current.feelslike}°C`, inline: true },
        { name: t('search.weather.wind'), value: current.winddisplay, inline: true },
        { name: t('search.weather.humidity'), value: `${current.humidity}%`, inline: true },
        { name: t('search.weather.observed'), value: `${current.date} ${current.observationtime}`, inline: true },
      );
  },

  async anime(interaction, query) {
    const { data } = await http.get('https://kitsu.io/api/edge/anime', {
      params: { 'filter[text]': query, 'page[limit]': 1 },
    });
    const [anime] = data?.data ?? [];
    if (!anime) return null;
    const a = anime.attributes;
    const t = interaction.t;
    return baseEmbed({ footer: false })
      .setColor('Purple')
      .setTitle(a.titles.en_us || a.titles.en_jp || query)
      .setDescription(truncate(a.synopsis ?? '—', 2000))
      .setThumbnail(a.posterImage?.original ?? null)
      .addFields(
        { name: t('search.anime.aired'), value: a.startDate || '—', inline: true },
        { name: t('search.anime.japanese'), value: a.titles.ja_jp || '—', inline: true },
        { name: t('search.anime.status'), value: capitalize(a.status ?? '—'), inline: true },
        { name: t('search.anime.rating'), value: a.averageRating ? `${a.averageRating}%` : 'N/A', inline: true },
        { name: t('search.anime.episodes'), value: `${a.episodeCount ?? 'N/A'}`, inline: true },
        { name: t('search.anime.type'), value: capitalize(a.showType ?? 'N/A'), inline: true },
      );
  },

  async wikipedia(interaction, query) {
    const { data } = await http.get(`https://${interaction.lang}.wikipedia.org/w/api.php`, {
      params: {
        action: 'query',
        generator: 'search',
        gsrsearch: query,
        gsrlimit: 1,
        prop: 'extracts',
        exintro: 1,
        explaintext: 1,
        format: 'json',
        formatversion: 2,
      },
      headers: { 'User-Agent': 'AkameBotDiscord/6.0 (https://github.com/Gh0zd/Akame-Bot-Discord)' },
    });
    const page = data?.query?.pages?.[0];
    if (!page?.title || !page.extract) return null;
    return baseEmbed({ footer: false })
      .setColor('Blue')
      .setTitle(`🌐 ${page.title}`)
      .setURL(`https://${interaction.lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`)
      .setDescription(truncate(page.extract, 3000));
  },
};

const QUERY_OPTIONS = {
  lyrics: 'title',
  pokemon: 'name',
  urban: 'term',
  weather: 'location',
  anime: 'name',
  wikipedia: 'query',
};

const data = rename(describe(new SlashCommandBuilder().setName('search'), 'commands.search.description'), 'commands.search.name');
for (const [name, option] of Object.entries(QUERY_OPTIONS)) {
  data.addSubcommand((sub) => describe(sub.setName(name), `commands.search.${name}`).addStringOption(stringOption(`commands.search.options.${name}`, option)));
}

module.exports = {
  data,
  cooldown: 5,

  async execute(interaction) {
    const name = interaction.options.getSubcommand();
    const query = interaction.options.getString(QUERY_OPTIONS[name], true);
    await interaction.deferReply();

    let embed;
    try {
      embed = await searches[name](interaction, query);
    } catch (error) {
      if (error.response?.status === 404) embed = null; // las APIs responden 404 cuando no hay resultado
      else return replyError(interaction, interaction.t('search.apiError'));
    }
    if (!embed) return replyError(interaction, interaction.t('search.notFound', { query: truncate(query, 80) }));
    await interaction.editReply({ embeds: [embed] });
  },
};
