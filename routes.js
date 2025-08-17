const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function createRoutes(database, geminiService) {
  
  // Get available models
  router.get('/models', (req, res) => {
    try {
      const modelsPath = path.join(__dirname, 'models.json');
      const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
      
      // Filter only enabled models
      const enabledModels = modelsData.models.filter(model => model.enabled);
      
      res.json({ models: enabledModels });
    } catch (error) {
      console.error('Error loading models:', error);
      res.status(500).json({ error: 'Failed to load available models' });
    }
  });
  router.post('/conversations', async (req, res) => {
    try {
      const { title } = req.body;
      const conversationId = await database.createConversation(title);
      const now = new Date().toISOString();
      res.json({ 
        id: conversationId, 
        title: title || 'New Chat',
        created_at: now,
        updated_at: now
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  router.get('/conversations', async (req, res) => {
    try {
      const conversations = await database.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  router.get('/conversations/:id/messages', async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await database.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  router.post('/conversations/:id/messages', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, model } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Use provided model or default
      const selectedModel = model || 'gemini-2.0-flash-exp';

      await database.addMessage(id, 'user', content);
      
      const messages = await database.getConversationMessages(id);
      
      const response = await geminiService.generateResponse(messages, selectedModel);
      
      await database.addMessage(id, 'assistant', response);
      await database.updateConversationTimestamp(id);

      res.json({ 
        user_message: content,
        assistant_response: response,
        model_used: selectedModel
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  router.delete('/conversations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await database.deleteConversation(id);
      
      if (deleted) {
        res.json({ success: true, message: 'Conversation deleted successfully' });
      } else {
        res.status(404).json({ error: 'Conversation not found' });
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  });

  router.put('/conversations/:conversationId/messages/:messageId', async (req, res) => {
    try {
      const { conversationId, messageId } = req.params;
      const { content, model } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Get the original message to check timestamp
      const originalMessage = await database.getMessageById(messageId);
      if (!originalMessage) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Update the message content
      await database.updateMessage(messageId, content);

      // Delete all messages after this one in the conversation
      await database.deleteMessagesAfter(conversationId, originalMessage.timestamp);

      // Get updated conversation history up to the edited message
      const messages = await database.getConversationMessages(conversationId);
      
      // Use provided model or default
      const selectedModel = model || 'gemini-2.0-flash-exp';

      // Generate new response from the AI
      const response = await geminiService.generateResponse(messages, selectedModel);
      
      // Add the new AI response
      await database.addMessage(conversationId, 'assistant', response);
      await database.updateConversationTimestamp(conversationId);

      res.json({ 
        success: true,
        updated_message: content,
        assistant_response: response,
        model_used: selectedModel
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({ error: 'Failed to edit message' });
    }
  });

  router.post('/chat', async (req, res) => {
    try {
      const { message, model } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Use provided model or default
      const selectedModel = model || 'gemini-2.0-flash-exp';

      const response = await geminiService.generateResponseSimple(message, selectedModel);
      
      res.json({ 
        response,
        model_used: selectedModel
      });
    } catch (error) {
      console.error('Simple chat error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  return router;
}

module.exports = createRoutes;