const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = 'gemini-2.0-flash-exp';
  }

  getModel(modelName = this.defaultModel) {
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateResponse(messages, modelName = this.defaultModel) {
    try {
      const model = this.getModel(modelName);
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate response from ${modelName}: ${error.message}`);
    }
  }

  async generateResponseSimple(prompt, modelName = this.defaultModel) {
    try {
      const model = this.getModel(modelName);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate response from ${modelName}: ${error.message}`);
    }
  }
}

module.exports = GeminiService;