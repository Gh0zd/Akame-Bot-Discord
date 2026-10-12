'use strict';

const { translate } = require('./i18n');

/** Código de idioma del bot → locale de Discord (el inglés es el valor base). */
const DISCORD_LOCALES = { es: 'es-ES', pt: 'pt-BR' };

const localizations = (key) =>
  Object.fromEntries(Object.entries(DISCORD_LOCALES).map(([lang, locale]) => [locale, translate(lang, key)]));

/** Aplica descripción (+ traducciones de Discord) a un builder a partir de una clave de locales. */
const describe = (builder, key) =>
  builder.setDescription(translate('en', key)).setDescriptionLocalizations(localizations(key));

/** Aplica nombre localizado opcional. Los nombres deben ser minúsculas y sin espacios. */
const rename = (builder, key) => builder.setNameLocalizations(localizations(key));

module.exports = { describe, rename };
