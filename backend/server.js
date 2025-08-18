require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');
const GeminiService = require('./gemini');
const createRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Servir imagens estáticas
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const database = new Database();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

app.use('/api', createRoutes(database, geminiService));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Chat Backend API',
    endpoints: {
      'GET /api/models': 'Get available AI models',
      'POST /api/conversations': 'Create new conversation',
      'GET /api/conversations': 'Get all conversations',
      'GET /api/conversations/:id/messages': 'Get messages for conversation',
      'POST /api/conversations/:id/messages': 'Send message to conversation (supports model parameter)',
      'POST /api/chat': 'Simple chat without conversation context (supports model parameter)'
    }
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  database.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Chat backend server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});