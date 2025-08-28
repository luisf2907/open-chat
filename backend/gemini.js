const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor(apiKey, databaseManager = null) {
    this.genAI = new GoogleGenAI({ apiKey });
    this.defaultModel = 'gemini-2.5-flash';
    this.databaseManager = databaseManager;
  }

  async generateResponse(messages, modelName = this.defaultModel, files = []) {
    try {
      // Verificar se é uma consulta de banco de dados
      if (this.databaseManager) {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (lastUserMessage) {
          const dbResponse = await this.handleDatabaseQuery(lastUserMessage.content);
          if (dbResponse) {
            return dbResponse;
          }
        }
      }
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
      // Verificar se é uma consulta de banco de dados
      if (this.databaseManager) {
        const dbResponse = await this.handleDatabaseQuery(prompt);
        if (dbResponse) {
          return dbResponse;
        }
      }
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

  async handleDatabaseQuery(userMessage) {
    try {
      // Verificar se é uma intenção de consulta de banco
      if (!this.databaseManager.isQueryIntention(userMessage)) {
        return null;
      }

      // Encontrar banco relevante
      const relevantDb = await this.databaseManager.findRelevantDatabase(userMessage);
      
      if (!relevantDb) {
        const databases = await this.databaseManager.getRegisteredDatabases();
        if (databases.length === 0) {
          return "Não há bancos de dados registrados. Use as configurações para adicionar um banco SQLite primeiro.";
        }
        
        const dbList = databases.map(db => `- ${db.name}: ${db.description || 'Sem descrição'}`).join('\n');
        return `Não consegui identificar qual banco consultar. Bancos disponíveis:\n${dbList}\n\nPor favor, seja mais específico sobre qual banco deseja consultar.`;
      }

      // Gerar consulta SQL usando IA
      const sqlQuery = await this.generateSQLQuery(userMessage, relevantDb);
      
      if (!sqlQuery) {
        return "Não consegui gerar uma consulta SQL apropriada para sua solicitação.";
      }

      // Executar a consulta
      const results = await this.databaseManager.executeQuery(relevantDb.name, sqlQuery);
      
      // Formatar resposta usando IA
      return await this.formatQueryResults(userMessage, sqlQuery, results, relevantDb);

    } catch (error) {
      console.error('Error handling database query:', error);
      return `Erro ao consultar banco de dados: ${error.message}`;
    }
  }

  async generateSQLQuery(userMessage, database) {
    try {
      // Obter estrutura do banco
      const schema = await this.databaseManager.getDatabaseSchema(database.name);
      
      const schemaText = Object.entries(schema).map(([tableName, columns]) => {
        const columnsText = columns.map(col => 
          `${col.name} (${col.type}${col.primaryKey ? ', PK' : ''}${col.nullable ? ', NULL' : ', NOT NULL'})`
        ).join(', ');
        return `Tabela ${tableName}: ${columnsText}`;
      }).join('\n');

      const prompt = `
Baseado no esquema do banco de dados abaixo, gere uma consulta SQL SELECT para responder à pergunta do usuário.

ESQUEMA DO BANCO DE DADOS:
${schemaText}

PERGUNTA DO USUÁRIO: ${userMessage}

INSTRUÇÕES:
- Gere APENAS a consulta SQL SELECT
- Não inclua explicações ou texto adicional
- Use nomes de tabelas e colunas exatamente como mostrados no esquema
- Se a pergunta não puder ser respondida com o esquema disponível, retorne "IMPOSSÍVEL"

CONSULTA SQL:`;

      const response = await this.generateResponseSimpleInternal(prompt);
      
      // Limpar a resposta
      let sqlQuery = response.trim();
      
      // Remover possíveis markdown
      if (sqlQuery.includes('```')) {
        const matches = sqlQuery.match(/```(?:sql)?\s*(.*?)\s*```/s);
        if (matches) {
          sqlQuery = matches[1].trim();
        }
      }

      // Verificar se é uma query válida
      if (sqlQuery === 'IMPOSSÍVEL' || !sqlQuery.toLowerCase().startsWith('select')) {
        return null;
      }

      return sqlQuery;
    } catch (error) {
      console.error('Error generating SQL query:', error);
      return null;
    }
  }

  async formatQueryResults(userMessage, sqlQuery, results, database) {
    try {
      const resultsText = results.length > 0 ? 
        JSON.stringify(results, null, 2) : 
        'Nenhum resultado encontrado.';

      const prompt = `
O usuário fez a seguinte pergunta: "${userMessage}"

Foi executada a seguinte consulta SQL no banco "${database.name}" (${database.description}):
${sqlQuery}

RESULTADOS:
${resultsText}

Por favor, formate uma resposta clara e amigável para o usuário, interpretando os resultados da consulta. Se não houver resultados, explique isso de forma amigável.`;

      return await this.generateResponseSimpleInternal(prompt);
    } catch (error) {
      console.error('Error formatting results:', error);
      return `Consulta executada com sucesso. Encontrados ${results.length} resultados:\n\n${JSON.stringify(results, null, 2)}`;
    }
  }

  // Método interno para evitar recursão infinita
  async generateResponseSimpleInternal(prompt, modelName = this.defaultModel) {
    try {
      const parts = [{ text: prompt }];

      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts }]
      });
      
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
}

module.exports = GeminiService;