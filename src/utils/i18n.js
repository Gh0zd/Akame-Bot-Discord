'use strict';

const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');
const logger = require('./logger');
const { settings } = require('../database/repositories');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const FALLBACK_LANGUAGE = 'en';

/** @type {Record<string, object>} */
const dictionaries = {};
const warned = new Set();

function loadLocales() {
  for (const language of config.supportedLanguages) {
    const file = path.join(LOCALES_DIR, `${language}.json`);
    dictionaries[language] = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
}

const lookup = (language, key) =>
  key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dictionaries[language]);

const interpolate = (text, vars) =>
  typeof text === 'string' ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match)) : text;

/**
 * Traduce `key` al idioma pedido.
 * Orden de búsqueda: idioma pedido → idioma por defecto → inglés → la propia clave.
 * Si la traducción es un array (p. ej. respuestas de 8ball) se devuelve el array interpolado.
 */
function translate(language, key, vars = {}) {
  const chain = [language, config.defaultLanguage, FALLBACK_LANGUAGE];
  for (const lang of chain) {
    const value = lookup(lang, key);
    if (value === undefined) continue;
    return Array.isArray(value) ? value.map((item) => interpolate(item, vars)) : interpolate(value, vars);
  }
  if (!warned.has(key)) {
    warned.add(key);
    logger.warn(`[i18n] Falta la clave "${key}" en todos los idiomas`);
  }
  return key;
}

/** Idioma efectivo: preferencia del usuario → del servidor → idioma por defecto. */
function resolveLanguage({ userId, guildId } = {}) {
  const candidates = [userId && settings.getUserLanguage(userId), guildId && settings.getGuildLanguage(guildId)];
  return candidates.find((lang) => lang && config.supportedLanguages.includes(lang)) ?? config.defaultLanguage;
}

/** Devuelve una función `t(key, vars)` ya ligada a un idioma. */
const createTranslator = (language) => (key, vars) => translate(language, key, vars);

const hasLanguage = (language) => config.supportedLanguages.includes(language);

module.exports = { loadLocales, translate, resolveLanguage, createTranslator, hasLanguage, dictionaries };
