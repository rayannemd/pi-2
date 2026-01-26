describe('API - Authentication', () => {
  let authToken;
  const userCredentials = {
    email: 'nathantest@test.test',
    password: '123456'
  };

  const randomCpf = () => Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');

  describe('Login - Testes de Campos Obrigatórios', () => {
    it('Deve fazer login com sucesso', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: userCredentials
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('email', userCredentials.email);
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('userType');
        authToken = response.body.token;
      });
    });

    it('Deve falhar o login com email não cadastrado', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'invalid@test.test',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('Deve falhar o login com senha inválida', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: userCredentials.email,
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('Deve falhar ao fazer login sem email', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          password: '123456'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao fazer login sem senha', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: userCredentials.email
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao fazer login com email vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: '',
          password: '123456'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao fazer login com senha vazia', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: userCredentials.email,
          password: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao fazer login com body vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao fazer login com null no body', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: null,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe('Criação de Usuário - Testes de Campos Obrigatórios', () => {
    it('Deve criar um novo usuário com sucesso', () => {
      const newUser = {
        name: 'Novo Usuário Teste',
        email: `teste${Date.now()}@test.test`,
        password: '123456',
        cpfCnpj: randomCpf(),
        type: 'CUSTOMER'
      };

      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: newUser
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('Não deve criar usuário com cpf/cnpj duplicado', () => {
      const newUser = {
        name: 'Novo Usuário Teste',
        email: `teste${Date.now()}@test.test`,
        password: '123456',
        cpfCnpj: '123456',
        type: 'CUSTOMER'
      };

      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: newUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(409);
      });
    });

    it('Deve falhar ao criar usuário sem campo name', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com name vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: '',
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com name contendo apenas espaços em branco', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: '   ',
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário sem campo email', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          password: '123456',
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com email vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: '',
          password: '123456',
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário sem campo password', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: `teste${Date.now()}@test.test`,
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com password vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: `teste${Date.now()}@test.test`,
          password: '',
          cpfCnpj: randomCpf(),
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário sem campo cpfCnpj', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com cpfCnpj vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          cpfCnpj: '',
          type: 'CUSTOMER'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário sem campo type', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          cpfCnpj: randomCpf()
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com type null', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Novo Usuário',
          email: `teste${Date.now()}@test.test`,
          password: '123456',
          cpfCnpj: randomCpf(),
          type: null
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com múltiplos campos obrigatórios ausentes', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {
          name: 'Usuário Incompleto'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com body vazio', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Deve falhar ao criar usuário com null no body', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth',
        body: null,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
});
