const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenAI({ apiKey });
    this.defaultModel = 'gemini-2.5-flash';
  }

  async generateResponse(messages, modelName = this.defaultModel) {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

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

  async generateResponseSimple(prompt, modelName = this.defaultModel) {
    try {
      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
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