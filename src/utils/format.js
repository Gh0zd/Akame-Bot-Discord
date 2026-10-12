'use strict';

const formatUptime = (ms) => {
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor(ms / 3_600_000) % 24;
  const minutes = Math.floor(ms / 60_000) % 60;
  const seconds = Math.floor(ms / 1000) % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const toUnix = (ms) => Math.floor(ms / 1000);
const discordTime = (ms, style = 'R') => `<t:${toUnix(ms)}:${style}>`;
const pick = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const capitalize = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);
const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
const progressBar = (value, max, filled, empty) => {
  const count = Math.max(0, Math.min(max, Math.floor(value)));
  return `${filled.repeat(count)}${empty.repeat(max - count)}`;
};

module.exports = { formatUptime, toUnix, discordTime, pick, randomInt, capitalize, truncate, progressBar };
