describe('API - Services', () => {
  const testServiceId = 1;
  const testService = {
    id: 1,
    name: 'Serviço De Teste',
    description: 'Apenas mais um teste'
  };

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/services',
      body: testService,
      failOnStatusCode: false
    });
  });

  it('should get all services', () => {
    cy.request({
      method: 'GET',
      url: '/api/services'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      // Verify test service exists
      const service = response.body.find(s => s.id === testServiceId);
      expect(service).to.exist;
    });
  });

  it('should get service by id', () => {
    cy.request({
      method: 'GET',
      url: `/api/services/${testServiceId}`
    }).then((serviceResponse) => {
      expect(serviceResponse.status).to.eq(200);
      expect(serviceResponse.body).to.have.property('id', testServiceId);
    });
  });

  it('should return 404 for non-existent service', () => {
    cy.request({
      method: 'GET',
      url: '/api/services/99999',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should create a new service', () => {
    const newService = {
      name: `Serviço Teste ${Date.now()}`,
      description: 'Descrição do serviço de teste'
    };

    cy.request({
      method: 'POST',
      url: '/api/services',
      body: newService
    }).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  it('should update service', () => {
    // First get all services to find one to update
    cy.request({
      method: 'GET',
      url: '/api/services'
    }).then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.length > 0) {
        const serviceToUpdate = response.body[0];
        const updateData = {
          name: 'Serviço Atualizado',
          description: 'Descrição atualizada'
        };
        cy.request({
          method: 'PUT',
          url: `/api/services/${serviceToUpdate.id}`,
          body: updateData
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body).to.have.property('name', updateData.name);
          expect(updateResponse.body).to.have.property('description', updateData.description);
        });
      }
    });
  });

  it('should return 404 when updating non-existent service', () => {
    const updateData = {
      name: 'Serviço Não Existente',
      description: 'Descrição'
    };
    cy.request({
      method: 'PUT',
      url: '/api/services/99999',
      body: updateData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should delete service', () => {
    // First create a service to delete
    const serviceToDelete = {
      name: `Serviço Para Deletar ${Date.now()}`,
      description: 'Este serviço será deletado'
    };

    cy.request({
      method: 'POST',
      url: '/api/services',
      body: serviceToDelete
    }).then(() => {
      // Get the created service
      cy.request({
        method: 'GET',
        url: '/api/services'
      }).then((response) => {
        const service = response.body.find(s => s.name === serviceToDelete.name);
        if (service) {
          cy.request({
            method: 'DELETE',
            url: `/api/services/${service.id}`
          }).then((deleteResponse) => {
            expect(deleteResponse.status).to.eq(204);
          });
        }
      });
    });
  });
});
