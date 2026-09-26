const { initDb, query } = require('./db.js');

try {
  console.log('Iniciando inicialização do banco de dados...');
  initDb();
  const tables = query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  console.log(`Sucesso! ${tables.length} tabelas encontradas no banco:`);
  tables.forEach(t => console.log(`  - ${t.name}`));
} catch (err) {
  console.error('Erro ao inicializar o banco:', err);
  process.exit(1);
}
