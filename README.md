# 💰 Controle Financeiro ECO

Sistema de controle financeiro completo desenvolvido com React e Node.js, permitindo gestão de transações, usuários e visualização de dados financeiros através de dashboards interativos.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [API Endpoints](#api-endpoints)
- [Contribuindo](#contribuindo)

## 🎯 Sobre o Projeto

O Controle Financeiro ECO é uma aplicação web fullstack que permite aos usuários gerenciar suas finanças pessoais de forma eficiente. O sistema oferece autenticação segura, registro de transações, visualização de dashboards com gráficos e controle diário/mensal das movimentações financeiras.

## ✨ Funcionalidades

- 🔐 **Autenticação de Usuários** - Login e registro com JWT
- 👥 **Gestão de Usuários** - Cadastro e administração de usuários
- 💸 **Controle de Transações** - Registro de receitas e despesas
- 📊 **Dashboard Interativo** - Visualização de dados com gráficos (Chart.js)
- 📅 **Controle Diário** - Acompanhamento das movimentações do dia
- 📈 **Resumo Mensal** - Análise financeira mensal
- 💼 **Página Financeira** - Visão geral completa das finanças
- 🎨 **Interface Responsiva** - Design moderno com SCSS

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript
- **React Router DOM** - Navegação entre páginas
- **Axios** - Cliente HTTP para requisições
- **Chart.js & React-Chartjs-2** - Visualização de dados
- **SASS/SCSS** - Pré-processador CSS
- **React Scripts** - Ferramentas de build

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **JSON Web Token (JWT)** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **CORS** - Controle de acesso cross-origin
- **dotenv** - Gerenciamento de variáveis de ambiente

### DevOps
- **Docker & Docker Compose** - Containerização do banco de dados

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)
- [Git](https://git-scm.com/)

### Verificar instalações:

```bash
node --version
npm --version
docker --version
```

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/LaisCalderado/controle-financeiro-eco.git
cd controle-financeiro-eco
```

### 2. Instale as dependências do projeto raiz

```bash
npm install
```

### 3. Instale as dependências do servidor

```bash
cd server
npm install
```

### 4. Instale as dependências do frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### 1. Banco de Dados

O projeto utiliza PostgreSQL via Docker. O arquivo `docker-compose.yml` já está configurado:

```yaml
# Configuração padrão:
- Porta: 5434 (host) → 5432 (container)
- Usuário: postgres
- Senha: postgres
- Database: finance
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `server/` com as seguintes variáveis:

```env
# Servidor
PORT=3333

# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/finance

# JWT
JWT_SECRET=seu_secret_key_aqui

# Ambiente
NODE_ENV=development
```

**Importante:** Nunca commit o arquivo `.env` no repositório!

### 3. Inicialização do Banco de Dados

Após configurar as variáveis de ambiente, você precisará criar as tabelas necessárias no banco de dados. Execute os scripts SQL de migração conforme necessário.

## 🎮 Executando o Projeto

### Passo 1: Iniciar o Banco de Dados

```bash
cd server
docker compose up -d
```

Para verificar se o container está rodando:
```bash
docker ps
```

### Passo 2: Iniciar o Servidor Backend

Em um terminal, execute:

```bash
cd server
npm run dev
```

O servidor estará disponível em: `http://localhost:3333`

### Passo 3: Iniciar o Frontend

Em outro terminal, execute:

```bash
cd frontend
npm start
```

O frontend estará disponível em: `http://localhost:3000`

### 🎉 Pronto!

Acesse `http://localhost:3000` no seu navegador para usar a aplicação.


## 🌐 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário

### Dashboard
- `GET /dashboard/:userId` - Dados do dashboard do usuário

### Transações
- `GET /api/transactions/:userId` - Lista transações do usuário
- `POST /api/transactions` - Cria nova transação
- `PUT /api/transactions/:id` - Atualiza transação
- `DELETE /api/transactions/:id` - Remove transação

### Usuários
- `GET /api/users` - Lista usuários
- `POST /api/users` - Cria novo usuário
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Remove usuário

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request


## 👥 Autores

- **Laís Calderado** - [GitHub](https://github.com/LaisCalderado)

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
