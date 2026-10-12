'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** Lista recursivamente los archivos .js de un directorio. */
function walkJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkJsFiles(full);
    return entry.isFile() && entry.name.endsWith('.js') ? [full] : [];
  });
}

module.exports = { walkJsFiles };
