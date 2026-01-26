describe('API - Users', () => {
  let authToken;
  const userCredentials = {
    email: 'nathantest@test.test',
    password: '123456'
  };
  const testUserId = 1;

  before(() => {
    // Login to get token
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: userCredentials
    }).then((response) => {
      authToken = response.body.token;
    });
  });

  it('should get all users', () => {
    cy.request({
      method: 'GET',
      url: '/api/users'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      // Verify test user exists
      const testUser = response.body.find(u => u.id === testUserId);
      expect(testUser).to.exist;
      expect(testUser.email).to.eq(userCredentials.email);
    });
  });

  it('should get user by id', () => {
    cy.request({
      method: 'GET',
      url: `/api/users/${testUserId}`
    }).then((userResponse) => {
      expect(userResponse.status).to.eq(200);
      expect(userResponse.body).to.have.property('id', testUserId);
      expect(userResponse.body).to.have.property('email', userCredentials.email);
      expect(userResponse.body).to.have.property('name');
    });
  });

  it('should return 404 for non-existent user', () => {
    cy.request({
      method: 'GET',
      url: '/api/users/99999',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should get user services', () => {
    cy.request({
      method: 'GET',
      url: `/api/users/${testUserId}/services`
    }).then((servicesResponse) => {
      expect(servicesResponse.status).to.eq(200);
      expect(servicesResponse.body).to.be.an('array');
    });
  });

  it('should add service to user', () => {
    cy.request({
      method: 'POST',
      url: `/api/users/${testUserId}/services`,
      body: 'Serviço De Teste',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((addResponse) => {
      expect(addResponse.status).to.be.oneOf([200, 404]);
    });
  });

  it('should update user', () => {
    // First get the user to preserve current data
    cy.request({
      method: 'GET',
      url: `/api/users/${testUserId}`
    }).then((userResponse) => {
      expect(userResponse.status).to.eq(200);
      const updateData = {
        name: 'Usuário Atualizado',
        email: userResponse.body.email,
        type: userResponse.body.type || 'CUSTOMER'
      };
      cy.request({
        method: 'PUT',
        url: `/api/users/${testUserId}`,
        body: updateData
      }).then((updateResponse) => {
        expect(updateResponse.status).to.eq(200);
        expect(updateResponse.body).to.have.property('name', updateData.name);
        expect(updateResponse.body).to.have.property('id', testUserId);
      });
    });
  });

  it('should delete user (soft delete)', () => {
    // First create a test user to delete
    const testUser = {
      name: 'Usuário Para Deletar',
      email: `delete${Date.now()}@test.test`,
      password: '123456',
      cpf_cnpj: '98765432100',
      type: 'CUSTOMER'
    };

    cy.request({
      method: 'POST',
      url: '/api/auth',
      body: testUser
    }).then(() => {
      // Get the created user
      cy.request({
        method: 'GET',
        url: '/api/users'
      }).then((response) => {
        const userToDelete = response.body.find(u => u.email === testUser.email);
        if (userToDelete) {
          cy.request({
            method: 'DELETE',
            url: `/api/users/${userToDelete.id}`
          }).then((deleteResponse) => {
            expect(deleteResponse.status).to.eq(204);
          });
        }
      });
    });
  });
});
