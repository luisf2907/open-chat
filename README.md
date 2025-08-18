# 🤖 Open Chat

Uma aplicação de chat moderna e elegante com IA integrada, construída com React + Vite no frontend e Node.js + Express no backend.

## ✨ Principais Funcionalidades

- 🎨 **Interface Moderna**: Design inspirado no ChatGPT/Gemini com tema dark/light
- 💬 **Chat Inteligente**: Integração com Google Gemini AI
- 🖼️ **Geração de Imagens**: Suporte completo ao Imagen 4 e Gemini Flash Image
- 🔄 **Modo Dual**: Alterne entre geração de texto e imagens facilmente
- 📝 **Edição de Mensagens**: Edite suas mensagens e receba novas respostas
- 🔄 **Efeito Typewriter**: Animação de digitação em tempo real
- 📱 **Responsivo**: Interface adaptável para desktop e mobile
- 💾 **Histórico Persistente**: Conversas e imagens salvas em SQLite
- 🌙 **Tema Dark/Light**: Alternância automática e manual de temas
- ✍️ **Markdown**: Suporte completo com syntax highlighting
- 🎯 **Scroll Inteligente**: Acompanha automaticamente as mensagens sendo digitadas
- 🗄️ **Persistência de Imagens**: Imagens armazenadas em Base64 no banco de dados

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Markdown** com syntax highlighting

### Backend
- **Node.js** com Express
- **SQLite3** para banco de dados
- **Google GenAI** para texto e imagens (Gemini + Imagen 4)
- **CORS** para requisições cross-origin
- **Armazenamento Base64** para persistência de imagens

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Chave de API do Google Gemini

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/luisf2907/open-chat.git
cd open-chat
```

### 2. Instale as dependências
```bash
# Instala dependências do backend e frontend
npm run install:deps
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na **pasta raiz** do projeto:

```bash
# .env (na pasta raiz do projeto)
GEMINI_API_KEY=sua_chave_da_api_do_gemini_aqui
```

#### 🔑 Como obter a chave da API do Gemini:

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Clique em "Get API Key" 
4. Crie uma nova chave de API
5. Copie a chave e cole no arquivo `.env`

### 4. Execute a aplicação

```bash
# Roda backend e frontend simultaneamente
npm run dev
```

**URLs de acesso:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📚 Scripts Disponíveis

### Na pasta raiz:
```bash
npm run dev          # Roda backend + frontend juntos
npm run start        # Roda em produção (backend + frontend preview)
npm run backend      # Roda apenas o backend
npm run frontend     # Roda apenas o frontend  
npm run build        # Build do frontend para produção
npm run install:deps # Instala dependências de ambos
```

### Na pasta frontend:
```bash
npm run dev        # Roda apenas o frontend
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Executa linting
```

### Na pasta backend:
```bash
npm run dev   # Roda com nodemon (auto-reload)
npm start     # Roda em produção
```

## 🎯 Como Usar

### 1. **Iniciar Nova Conversa**
- Clique em "Nova conversa" na sidebar
- Ou comece digitando diretamente

### 2. **Alternar entre Texto e Imagem**
- Use os botões **"Texto"** e **"Imagem"** na barra superior
- **Modo Texto**: Para conversas normais com IA
- **Modo Imagem**: Para gerar imagens com Imagen 4 ou Gemini Flash Image

### 3. **Selecionar Modelos de IA**
- **Para Texto**: Gemini 2.5 Flash, Gemini 2.5 Pro
- **Para Imagem**: Imagen 4, Gemini 2.0 Flash Image
- O seletor muda automaticamente conforme o modo ativo

### 4. **Gerar Imagens**
- Ative o modo **"Imagem"**
- Digite uma descrição detalhada (ex: "um gato laranja comendo peixe")
- As imagens são salvas permanentemente no banco de dados

### 5. **Editar Mensagens**
- Passe o mouse sobre sua mensagem
- Clique no ícone de edição que aparece
- Edite o texto e clique "Salvar"
- Todas as mensagens seguintes serão removidas e uma nova resposta será gerada

### 6. **Alternar Temas**
- Use o botão de sol/lua na sidebar
- Ou deixe detectar automaticamente o tema do sistema

### 7. **Gerenciar Conversas**
- Navegue pelo histórico na sidebar
- Delete conversas com o ícone da lixeira
- Conversas e imagens são salvas automaticamente

## 📁 Estrutura do Projeto

```
open-chat/
├── README.md
├── package.json              # Scripts principais e concurrently
├── .env                      # Variáveis de ambiente (criar)
├── backend/
│   ├── package.json         # Dependências do backend
│   ├── server.js            # Servidor Express
│   ├── routes.js            # Rotas da API
│   ├── database.js          # Configuração SQLite
│   ├── gemini.js            # Integração Gemini AI
│   ├── models.json          # Configuração dos modelos
│   └── chat.db              # Banco SQLite (criado automaticamente)
└── frontend/
    ├── package.json         # Dependências do frontend
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── contexts/        # Context API (Temas)
    │   ├── hooks/          # Custom hooks
    │   └── ...
    ├── dist/               # Build de produção
    └── ...
```

## 🔧 Configuração Avançada

### Personalizando Modelos

Edite o arquivo `backend/models.json` para adicionar/remover modelos:

```json
{
  "textModels": [
    {
      "id": "gemini-2.5-flash",
      "name": "Gemini 2.5 Flash",
      "description": "Modelo rápido e eficiente",
      "badge": "NOVO",
      "type": "text",
      "enabled": true,
      "default": true
    }
  ],
  "imageModels": [
    {
      "id": "imagen-4.0-generate-001",
      "name": "Imagen 4",
      "description": "Geração de imagens com IA",
      "badge": "NOVO",
      "type": "image",
      "enabled": true,
      "default": true
    }
  ]
}
```

## 🖼️ Recursos de Geração de Imagens

### **Modelos Suportados:**
- **Imagen 4** - Modelo mais recente do Google para geração de imagens
- **Gemini 2.0 Flash Image** - Modelo gratuito com geração de imagens

### **Características:**
- ✅ **Persistência Total**: Imagens salvas em Base64 no banco SQLite
- ✅ **Sem Dependências Externas**: Não precisa de armazenamento de arquivos
- ✅ **Histórico Completo**: Imagens aparecem sempre que você voltar à conversa
- ✅ **Interface Intuitiva**: Botões dedicados para alternar entre texto/imagem
- ✅ **Seletor Dinâmico**: Modelos mudam automaticamente conforme o modo

### **Como Funciona:**
1. **Geração**: IA gera a imagem via API do Google
2. **Armazenamento**: Imagem convertida para Base64 e salva no SQLite
3. **Exibição**: Frontend renderiza via `data:image/png;base64,${data}`
4. **Persistência**: Imagem permanece salva para sempre no histórico

### Variáveis de Ambiente Adicionais

```bash
# .env
GEMINI_API_KEY=sua_chave_aqui
PORT=3000                    # Porta do backend (opcional)
FRONTEND_URL=http://localhost:5173  # URL do frontend (opcional)
```

## 🐛 Solução de Problemas

### Erro: "GEMINI_API_KEY não encontrada"
- Verifique se o arquivo `.env` está na pasta raiz
- Confirme se a variável está escrita corretamente
- Reinicie o servidor após criar/editar o `.env`

### Erro de CORS
- Verifique se o frontend está rodando na porta 5173
- Confirme se o backend está na porta 3000

### Banco de dados não encontrado
- O arquivo `chat.db` é criado automaticamente na primeira execução
- Se houver problemas, delete o arquivo e reinicie

### Dependências não instaladas
```bash
# Limpa cache e reinstala
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm run install:deps
```

### Problemas com Geração de Imagens
- **Erro "modelo não encontrado"**: Verifique se está usando Imagen 4 ou Gemini Flash Image
- **Imagens não aparecem**: Verifique se o banco de dados tem as colunas `message_type` e `image_data`
- **API Key inválida**: Confirme se a chave tem permissões para geração de imagens
- **Imagem muito grande**: O Base64 pode causar lentidão em imagens muito grandes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 👥 Autor

**Luis Felipe Werneck** - [@luisf2907](https://github.com/luisf2907)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!
