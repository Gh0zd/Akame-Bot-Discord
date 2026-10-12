'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const migrations = require('./schema');

let db = null;

/** Abre la base de datos (crea la carpeta/archivo si no existen) y aplica migraciones. */
function openDatabase(filePath) {
  if (db) return db;

  const inMemory = filePath === ':memory:';
  const resolved = inMemory ? filePath : path.resolve(filePath);
  if (!inMemory) fs.mkdirSync(path.dirname(resolved), { recursive: true });

  db = new Database(resolved);
  db.pragma('journal_mode = WAL'); // lecturas concurrentes sin bloquear escrituras
  db.pragma('synchronous = NORMAL'); // seguro con WAL y bastante más rápido
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  return db;
}

function runMigrations(database) {
  const current = database.pragma('user_version', { simple: true });
  for (let version = current; version < migrations.length; version++) {
    database.transaction(() => {
      database.exec(migrations[version]);
      database.pragma(`user_version = ${version + 1}`);
    })();
  }
}

function getDatabase() {
  if (!db) throw new Error('La base de datos no está abierta. Llama a openDatabase() primero.');
  return db;
}

function closeDatabase() {
  if (db) db.close();
  db = null;
}

module.exports = { openDatabase, getDatabase, closeDatabase };
