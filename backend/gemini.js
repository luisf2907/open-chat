const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenAI({ apiKey });
    this.defaultModel = 'gemini-2.5-flash';
  }

  async generateResponse(messages, modelName = this.defaultModel, files = []) {
    try {
      const formattedMessages = messages.map(msg => {
        const messageParts = [{ text: msg.content }];
        
        // Adiciona arquivos do histórico se existirem
        if (msg.files_data) {
          try {
            const savedFiles = JSON.parse(msg.files_data);
            savedFiles.forEach(file => {
              messageParts.push({
                inlineData: {
                  mimeType: file.type,
                  data: file.data
                }
              });
            });
          } catch (error) {
            console.error('Error parsing saved files:', error);
          }
        }
        
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: messageParts
        };
      });

      // Se houver arquivos novos (da requisição atual), adiciona na última mensagem do usuário
      if (files.length > 0 && formattedMessages.length > 0) {
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        if (lastMessage.role === 'user') {
          files.forEach(file => {
            lastMessage.parts.push({
              inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString('base64')
              }
            });
          });
        }
      }

      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: formattedMessages
      });
      // Normalize text result across SDK variants
      let text = '';
      if (response) {
        if (typeof response.text === 'function') {
          try { text = response.text(); } catch (_) { /* noop */ }
        } else if (typeof response.text === 'string') {
          text = response.text;
        }
        if (!text && Array.isArray(response.candidates) && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.text) text += part.text;
          }
        }
      }
      return text || '';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate response from ${modelName}: ${error.message}`);
    }
  }

  async generateResponseSimple(prompt, modelName = this.defaultModel, files = []) {
    try {
      const parts = [{ text: prompt }];
      
      // Adiciona arquivos se houver
      if (files.length > 0) {
        files.forEach(file => {
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString('base64')
            }
          });
        });
      }

      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts }]
      });
      // Normalize text result across SDK variants
      let text = '';
      if (response) {
        if (typeof response.text === 'function') {
          try { text = response.text(); } catch (_) { /* noop */ }
        } else if (typeof response.text === 'string') {
          text = response.text;
        }
        if (!text && Array.isArray(response.candidates) && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.text) text += part.text;
          }
        }
      }
      return text || '';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate response from ${modelName}: ${error.message}`);
    }
  }

  async generateImage(prompt, modelName = 'imagen-4.0-generate-001') {
    try {
      
      if (modelName.includes('imagen')) {
        // Para modelos Imagen, usa generateImages API
        const response = await this.genAI.models.generateImages({
          model: modelName,
          prompt: prompt,
          config: {
            numberOfImages: 1,
          },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
          const generatedImage = response.generatedImages[0];
          const imgBytes = generatedImage.image.imageBytes;

          return {
            text: 'Imagem gerada com sucesso!',
            imageData: imgBytes
          };
        }
        
        throw new Error('No image data found in Imagen response');
      } else {
        // Para modelos Gemini, usa responseModalities
        const response = await this.genAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
          },
        });

        let imageBase64 = null;
        let textResponse = '';

        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            textResponse = part.text;
          } else if (part.inlineData) {
            imageBase64 = part.inlineData.data;
          }
        }

        if (imageBase64) {
          return {
            text: textResponse,
            imageData: imageBase64
          };
        }

        throw new Error('No image was generated');
      }
    } catch (error) {
      console.error('Image API error:', error);
      throw new Error(`Failed to generate image from ${modelName}: ${error.message}`);
    }
  }
}

module.exports = GeminiService;