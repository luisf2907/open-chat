const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'chat.db'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          message_type TEXT DEFAULT 'text',
          image_data TEXT,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
      `);

      // Adicionar colunas para mensagens existentes (migration)
      this.db.run(`ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding message_type column:', err);
        }
      });
      
      this.db.run(`ALTER TABLE messages ADD COLUMN image_data TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding image_data column:', err);
        }
      });

      this.db.run(`ALTER TABLE messages ADD COLUMN attachments TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding attachments column:', err);
        }
      });

      this.db.run(`ALTER TABLE messages ADD COLUMN files_data TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding files_data column:', err);
        }
      });
    });
  }

  createConversation(title = 'New Chat') {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO conversations (title) VALUES (?)',
        [title],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getConversations() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM conversations ORDER BY updated_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getConversationMessages(conversationId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [conversationId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  addMessage(conversationId, role, content, messageType = 'text', imageData = null, attachments = null, filesData = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO messages (conversation_id, role, content, message_type, image_data, attachments, files_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [conversationId, role, content, messageType, imageData, attachments, filesData],
        function(err) {
          if (err) reject(err);
          else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  updateConversationTimestamp(conversationId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  deleteConversation(conversationId) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // First delete all messages from the conversation
        this.db.run(
          'DELETE FROM messages WHERE conversation_id = ?',
          [conversationId],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Then delete the conversation itself
            this.db.run(
              'DELETE FROM conversations WHERE id = ?',
              [conversationId],
              function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
              }
            );
          }
        );
      });
    });
  }

  updateMessage(messageId, newContent) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE messages SET content = ? WHERE id = ?',
        [newContent, messageId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  deleteMessagesAfter(conversationId, messageTimestamp) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM messages WHERE conversation_id = ? AND timestamp > ?',
        [conversationId, messageTimestamp],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  getMessageById(messageId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM messages WHERE id = ?',
        [messageId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;