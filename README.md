# 🤖 Open Chat

Uma aplicação de chat moderna e elegante com IA integrada, construída com React + Vite no frontend e Node.js + Express no backend.

## ✨ Principais Funcionalidades

- 🎨 **Interface Moderna**: Design inspirado no ChatGPT/Gemini com tema dark/light
- 💬 **Chat Inteligente**: Integração com Google Gemini AI
- 📝 **Edição de Mensagens**: Edite suas mensagens e receba novas respostas
- 🔄 **Efeito Typewriter**: Animação de digitação em tempo real
- 📱 **Responsivo**: Interface adaptável para desktop e mobile
- 💾 **Histórico Persistente**: Conversas salvas em SQLite
- 🌙 **Tema Dark/Light**: Alternância automática e manual de temas
- ✍️ **Markdown**: Suporte completo com syntax highlighting
- 🎯 **Scroll Inteligente**: Acompanha automaticamente as mensagens sendo digitadas

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
- **Google Generative AI** (Gemini)
- **CORS** para requisições cross-origin

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
npm run install:all
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
npm run dev         # Roda backend + frontend juntos
npm run backend     # Roda apenas o backend
npm run frontend    # Roda apenas o frontend  
npm run install:all # Instala dependências de ambos
```

### Na pasta frontend:
```bash
npm run dev        # Roda apenas o frontend
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Executa linting
npm run dev:full   # Roda backend + frontend
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

### 2. **Selecionar Modelo de IA**
- Use o seletor no topo para escolher o modelo
- Modelos disponíveis: Gemini Flash, Pro, etc.

### 3. **Editar Mensagens**
- Passe o mouse sobre sua mensagem
- Clique no ícone de edição que aparece
- Edite o texto e clique "Salvar"
- Todas as mensagens seguintes serão removidas e uma nova resposta será gerada

### 4. **Alternar Temas**
- Use o botão de sol/lua na sidebar
- Ou deixe detectar automaticamente o tema do sistema

### 5. **Gerenciar Conversas**
- Navegue pelo histórico na sidebar
- Delete conversas com o ícone da lixeira
- Conversas são salvas automaticamente

## 📁 Estrutura do Projeto

```
open-chat/
├── README.md
├── package.json              # Scripts principais e concurrently
├── .env                      # Variáveis de ambiente (criar)
├── backend/
│   ├── server.js            # Servidor Express
│   ├── routes.js            # Rotas da API
│   ├── database.js          # Configuração SQLite
│   ├── gemini.js            # Integração Gemini AI
│   ├── models.json          # Configuração dos modelos
│   ├── package.json
│   └── chat.db              # Banco SQLite (criado automaticamente)
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── contexts/        # Context API (Temas)
    │   ├── hooks/          # Custom hooks
    │   └── ...
    ├── package.json
    └── dist/               # Build de produção
```

## 🔧 Configuração Avançada

### Personalizando Modelos

Edite o arquivo `backend/models.json` para adicionar/remover modelos:

```json
{
  "models": [
    {
      "id": "gemini-2.5-flash",
      "name": "Gemini 2.5 Flash",
      "description": "Modelo rápido e eficiente",
      "badge": "Rápido",
      "enabled": true,
      "default": true
    }
  ]
}
```

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
rm -rf frontend/node_modules frontend/package-lock.json
npm run install:all
```

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
