'use strict';

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const format = (level, args) => [`[${stamp()}] [${level}]`, ...args];

module.exports = {
  info: (...args) => console.log(...format('INFO', args)),
  warn: (...args) => console.warn(...format('WARN', args)),
  error: (...args) => console.error(...format('ERROR', args)),
};
