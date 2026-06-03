# 🧪 Testes - PI2 Bot Service

Suíte de testes automatizados para o projeto PI2 Bot Service usando Cypress e Allure Reports.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem instalado:

- **Node.js** (v14 ou superior)
- **npm** (gerenciador de pacotes do Node.js)

## 🚀 Instalação

1. Navegue até o diretório de testes:

```bash
cd pi-2/tests
```

2. Instale as dependências:

```bash
npm install
```

## 🧪 Executando os Testes

### Executar todos os testes com relatório

```bash
npm run test:report
```

Este comando:
- Remove diretórios de resultados anteriores (`allure-results` e `cypress/screenshots`)
- Executa todos os testes com o navegador Chrome
- Gera os dados necessários para o relatório Allure

### Abrir relatório Allure

Após executar os testes com `npm run test:report`, abra o relatório:

```bash
npm run report:open
```

Este comando:
- Gera o relatório HTML do Allure a partir dos resultados
- Abre automaticamente o relatório no navegador padrão

### Executar testes no modo interativo (Cypress UI)

Para rodar os testes em modo interativo com a interface do Cypress:

```bash
npx cypress open
```

## 📁 Estrutura do Projeto

```
tests/
├── cypress/
│   ├── e2e/
│   │   ├── api/
│   │   │   ├── auth.cy.js        # Testes de autenticação
│   │   │   ├── chats.cy.js       # Testes de chats
│   │   │   ├── services.cy.js    # Testes de serviços
│   │   │   └── users.cy.js       # Testes de usuários
│   │   └── ...
│   ├── support/
│   └── screenshots/              # Capturas de tela (geradas automaticamente)
├── allure-results/               # Dados dos testes (gerados automaticamente)
├── allure-report/                # Relatório HTML (gerado automaticamente)
├── cypress.config.js             # Configuração do Cypress
├── package.json                  # Dependências e scripts
└── README.md                      # Este arquivo
```

## 🔧 Configuração

A configuração padrão está em `cypress.config.js`:

- **baseUrl**: `http://localhost:8080` (URL da API)
- **Browser**: Chrome (padrão para testes automatizados)
- **Plugin Allure**: Integrado para gerar relatórios

Se precisar alterar a URL da API, edite o arquivo `cypress.config.js`.

## 📊 Testes Disponíveis

### API - Authentication (auth.cy.js)
- Login com sucesso
- Validação de campos obrigatórios
- Tratamento de credenciais inválidas
- Registro de novos usuários

### API - Chats (chats.cy.js)
- Obter todos os chats
- Obter chat por ID
- Criar novo chat

### API - Services (services.cy.js)
- Obter todos os serviços
- Obter serviço por ID
- Criar novo serviço

### API - Users (users.cy.js)
- Obter todos os usuários
- Obter usuário por ID
- Criar novo usuário

## 🎯 Fluxo de Testes Recomendado

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar testes e gerar relatório**:
   ```bash
   npm run test:report
   ```

3. **Abrir e visualizar relatório**:
   ```bash
   npm run report:open
   ```

## ⚠️ Troubleshooting

### Erro: "Cannot connect to http://localhost:8080"
- Certifique-se de que o servidor API está rodando
- Verifique se a porta 8080 está correta em `cypress.config.js`

### Erro: "Allure command not found"
- Instale o Allure globalmente: `npm install -g allure-commandline`
- Ou use o Allure local do npm

### Testes falhando aleatoriamente
- Aumente o timeout em `cypress.config.js` se necessário
- Verifique se o servidor está respondendo corretamente

## 📚 Documentação Adicional

- [Documentação do Cypress](https://docs.cypress.io/)
- [Documentação do Allure](https://docs.qameta.io/allure/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

## 📄 Licença

ISC
