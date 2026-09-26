const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DB_DIR = path.resolve(__dirname);
const DB_PATH = path.join(DB_DIR, 'escola_design.sqlite');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }
  return dbInstance;
}

function initDb() {
  const db = getDb();
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);
  }
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users;').get();
    if (row && Number(row.count) === 0) {
      console.log('Banco de dados vazio detectado. Executando seed automático...');
      const { runSeed } = require('./seed.js');
      runSeed();
    }
  } catch (err) {
    // Tabela pode ainda estar sendo criada
  }
  return db;
}

function query(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  // Ensure plain JSON objects
  return rows.map(r => Object.assign({}, r));
}

function get(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  const row = stmt.get(...params);
  return row ? Object.assign({}, row) : null;
}

function run(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function exec(sql) {
  const db = getDb();
  return db.exec(sql);
}

function transaction(fn) {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const result = fn({ query, get, run, exec });
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

module.exports = {
  getDb,
  initDb,
  query,
  get,
  run,
  exec,
  transaction,
  DB_PATH
};
