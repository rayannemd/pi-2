# pi-2
Este sistema oferece gerenciamento de usuários e integração com um chatbot inteligente, capaz de atender clientes e solucionar dúvidas de forma automática. 

## Pré-requisitos
- **Java 17** 
- **Maven** (o repositório já possui o wrapper, então não é obrigatório instalá-lo) 
- **MySQL 8+**, com o banco `chatbot` previamente criado (configuração atualmente em [application.properties](botservice/src/main/resources/application.properties)):

As configurações padrão estão em: botservice/src/main/resources/application.properties, ajuste conforme necessário.

---

## Como executar o projeto

### 1. Criar e configurar o banco
Criar o banco `chatbot` no MySQL e, caso necessário, ajuste credenciais em [botservice/src/main/resources/application.properties](botservice/src/main/resources/application.properties). 

### 2. Rodar a aplicação

Linux/macOS:
   - cd para a pasta do módulo e execute com o wrapper:
     - cd botservice
     - ./mvnw spring-boot:run
   - ou empacote e execute:
     - ./mvnw package
     - java -jar target/*.jar

Windows:
   - cd botservice
   - mvnw.cmd spring-boot:run

---

## Endpoints principais
Após iniciar, a API estará disponível em:
`http://localhost:8080/api`

- **Autenticação: /api/auth** — `AuthenticationController` ([file](botservice/src/main/java/br/ufc/crateus/pi2/botservice/controllers/AuthenticationController.java))  
  - POST `/api/auth` — cria um usuário
  - POST `/api/auth/login` — autentica usuário (retorna token JWT)
- **Usuários: /api/users** — `UserController` ([file](botservice/src/main/java/br/ufc/crateus/pi2/botservice/controllers/UserController.java))  
  - GET `/api/users` — listar todos os usuários
  - GET `/api/users/{id}` — obtém um usuário por ID
  - PUT `/api/users/{id}` — atualiza um usuário
  - DELETE `/api/users/{id}` — soft-delete do usuário

---

## Configurações importantes
- JWT secret: propriedade `${api.security.token.secret}` é utilizada por [TokenService](botservice/src/main/java/br/ufc/crateus/pi2/botservice/services/TokenService.java). Defina-a em `application.properties` ou via variável de ambiente.  
