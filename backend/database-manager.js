const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    // Banco principal para gerenciar os bancos registrados
    this.mainDb = new sqlite3.Database(path.join(__dirname, 'chat.db'));
    this.connectedDatabases = new Map();
    this.init();
  }

  init() {
    this.mainDb.serialize(() => {
      // Tabela para armazenar informações dos bancos registrados
      this.mainDb.run(`
        CREATE TABLE IF NOT EXISTS registered_databases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          path TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_accessed DATETIME
        )
      `);
    });
  }

  // Registrar um novo banco de dados
  async registerDatabase(name, dbPath, description = '') {
    return new Promise((resolve, reject) => {
      // Verificar se o arquivo existe
      if (!fs.existsSync(dbPath)) {
        reject(new Error(`Arquivo de banco não encontrado: ${dbPath}`));
        return;
      }

      // Verificar se é um arquivo SQLite válido
      try {
        const testDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
        testDb.close((err) => {
          if (err) {
            reject(new Error(`Arquivo não é um banco SQLite válido: ${err.message}`));
            return;
          }

          // Inserir no registro
          this.mainDb.run(
            'INSERT INTO registered_databases (name, path, description) VALUES (?, ?, ?)',
            [name, dbPath, description],
            function(err) {
              if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                  reject(new Error(`Já existe um banco registrado com o nome: ${name}`));
                } else {
                  reject(err);
                }
              } else {
                resolve({ id: this.lastID, name, path: dbPath, description });
              }
            }
          );
        });
      } catch (error) {
        reject(new Error(`Erro ao verificar arquivo SQLite: ${error.message}`));
      }
    });
  }

  // Listar bancos registrados
  async getRegisteredDatabases() {
    return new Promise((resolve, reject) => {
      this.mainDb.all(
        'SELECT * FROM registered_databases ORDER BY name ASC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Remover banco registrado
  async unregisterDatabase(name) {
    return new Promise((resolve, reject) => {
      // Fechar conexão se estiver aberta
      if (this.connectedDatabases.has(name)) {
        this.connectedDatabases.get(name).close();
        this.connectedDatabases.delete(name);
      }

      this.mainDb.run(
        'DELETE FROM registered_databases WHERE name = ?',
        [name],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  // Conectar a um banco específico
  async connectToDatabase(name) {
    return new Promise((resolve, reject) => {
      // Se já está conectado, retorna a conexão existente
      if (this.connectedDatabases.has(name)) {
        resolve(this.connectedDatabases.get(name));
        return;
      }

      // Buscar informações do banco
      this.mainDb.get(
        'SELECT * FROM registered_databases WHERE name = ?',
        [name],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            reject(new Error(`Banco '${name}' não encontrado nos registros`));
            return;
          }

          // Verificar se o arquivo ainda existe
          if (!fs.existsSync(row.path)) {
            reject(new Error(`Arquivo do banco não encontrado: ${row.path}`));
            return;
          }

          try {
            const db = new sqlite3.Database(row.path, sqlite3.OPEN_READONLY);
            this.connectedDatabases.set(name, db);

            // Atualizar último acesso
            this.mainDb.run(
              'UPDATE registered_databases SET last_accessed = CURRENT_TIMESTAMP WHERE name = ?',
              [name]
            );

            resolve(db);
          } catch (error) {
            reject(new Error(`Erro ao conectar ao banco: ${error.message}`));
          }
        }
      );
    });
  }

  // Obter estrutura do banco (tabelas e colunas)
  async getDatabaseSchema(name) {
    const db = await this.connectToDatabase(name);
    
    return new Promise((resolve, reject) => {
      // Obter lista de tabelas
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (err, tables) => {
          if (err) {
            reject(err);
            return;
          }

          const schema = {};
          let pendingTables = tables.length;

          if (pendingTables === 0) {
            resolve(schema);
            return;
          }

          tables.forEach(table => {
            // Obter informações das colunas para cada tabela
            db.all(
              `PRAGMA table_info(${table.name})`,
              (err, columns) => {
                if (err) {
                  reject(err);
                  return;
                }

                schema[table.name] = columns.map(col => ({
                  name: col.name,
                  type: col.type,
                  nullable: !col.notnull,
                  primaryKey: col.pk === 1
                }));

                pendingTables--;
                if (pendingTables === 0) {
                  resolve(schema);
                }
              }
            );
          });
        }
      );
    });
  }

  // Executar query em um banco específico
  async executeQuery(name, query, params = []) {
    const db = await this.connectToDatabase(name);
    
    return new Promise((resolve, reject) => {
      // Apenas permitir SELECT queries por segurança
      const trimmedQuery = query.trim().toUpperCase();
      if (!trimmedQuery.startsWith('SELECT')) {
        reject(new Error('Apenas consultas SELECT são permitidas'));
        return;
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Identificar qual banco usar baseado na descrição/contexto
  async findRelevantDatabase(userMessage) {
    const databases = await this.getRegisteredDatabases();
    
    const message = userMessage.toLowerCase();
    
    // Procurar por menções diretas ao nome do banco
    for (const db of databases) {
      if (message.includes(db.name.toLowerCase())) {
        return db;
      }
    }

    // Procurar por palavras-chave na descrição
    for (const db of databases) {
      if (db.description) {
        const descriptionWords = db.description.toLowerCase().split(/\s+/);
        const messageWords = message.split(/\s+/);
        
        const commonWords = descriptionWords.filter(word => 
          messageWords.some(msgWord => 
            msgWord.includes(word) || word.includes(msgWord)
          )
        );

        if (commonWords.length > 0) {
          return db;
        }
      }
    }

    return null;
  }

  // Verificar se a mensagem parece ser uma consulta de banco
  isQueryIntention(userMessage) {
    const queryKeywords = [
      'consultar', 'buscar', 'encontrar', 'verificar', 'mostrar',
      'listar', 'dados', 'tabela', 'banco', 'database', 'select',
      'quantos', 'qual', 'quais', 'quando', 'onde', 'como'
    ];

    const message = userMessage.toLowerCase();
    return queryKeywords.some(keyword => message.includes(keyword));
  }

  close() {
    // Fechar todas as conexões abertas
    for (const [name, db] of this.connectedDatabases) {
      db.close();
    }
    this.connectedDatabases.clear();
    
    // Fechar banco principal
    this.mainDb.close();
  }
}

module.exports = DatabaseManager;