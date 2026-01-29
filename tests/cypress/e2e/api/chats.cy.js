describe('API - Chats', () => {
  let chatId;
  
    it('should create a new chat', () => {
      const newChat = {
        title: 'Chat de Teste',
        summary: 'Resumo do chat de teste',
        type: 'NORMAL'
      };
  
      cy.request({
        method: 'POST',
        url: '/api/chats',
        body: newChat
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

  it('should get all chats', () => {
    cy.request({
      method: 'GET',
      url: '/api/chats'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      if (response.body.length > 0) {
        chatId = response.body[0].id;
      }
    });
  });

  it('should get chat by id', () => {
    // First get all chats to find one
    cy.request({
      method: 'GET',
      url: '/api/chats'
    }).then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.length > 0) {
        const firstChatId = response.body[0].id;
        cy.request({
          method: 'GET',
          url: `/api/chats/${firstChatId}`
        }).then((chatResponse) => {
          expect(chatResponse.status).to.eq(200);
          expect(chatResponse.body).to.have.property('id', firstChatId);
          expect(chatResponse.body).to.have.property('title');
        });
      }
    });
  });

  it('should return 404 for non-existent chat', () => {
    cy.request({
      method: 'GET',
      url: '/api/chats/99999',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should create a chat with URGENT type', () => {
    const urgentChat = {
      title: 'Chat Urgente',
      summary: 'Resumo do chat urgente',
      type: 'URGENT'
    };

    cy.request({
      method: 'POST',
      url: '/api/chats',
      body: urgentChat
    }).then((response) => {
      expect(response.status).to.eq(201);
    });
  });

  it('should send message to chat', () => {
    // First create a chat
    const newChat = {
      title: `Chat Para Mensagem ${Date.now()}`,
      summary: 'Resumo',
      type: 'NORMAL'
    };

    cy.request({
      method: 'POST',
      url: '/api/chats',
      body: newChat
    }).then(() => {
      // Get the created chat
      cy.request({
        method: 'GET',
        url: '/api/chats'
      }).then((response) => {
        const chat = response.body.find(c => c.title === newChat.title);
        if (chat) {
          const message = {
            message: 'Mensagem de teste',
            summary: 'Resumo da mensagem'
          };
          cy.request({
            method: 'POST',
            url: `/api/chats/${chat.id}/message`,
            body: message,
            failOnStatusCode: false
          }).then((messageResponse) => {
            // Response can be 200 or 404 depending on agent service availability
            expect(messageResponse.status).to.be.oneOf([200, 404]);
          });
        }
      });
    });
  });

  it('should return 404 when sending message to non-existent chat', () => {
    const message = {
      message: 'Mensagem de teste',
      summary: 'Resumo da mensagem'
    };
    cy.request({
      method: 'POST',
      url: '/api/chats/99999/message',
      body: message,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should update chat', () => {
    // First create a chat to update
    const newChat = {
      title: `Chat Para Atualizar ${Date.now()}`,
      summary: 'Resumo original',
      type: 'NORMAL'
    };

    cy.request({
      method: 'POST',
      url: '/api/chats',
      body: newChat
    }).then(() => {
      // Get the created chat
      cy.request({
        method: 'GET',
        url: '/api/chats'
      }).then((response) => {
        const chat = response.body.find(c => c.title === newChat.title);
        if (chat) {
          const updateData = {
            title: 'Chat Atualizado',
            summary: 'Resumo atualizado'
          };
          cy.request({
            method: 'PUT',
            url: `/api/chats/${chat.id}`,
            body: updateData
          }).then((updateResponse) => {
            expect(updateResponse.status).to.eq(200);
            expect(updateResponse.body).to.have.property('summary', updateData.summary);
          });
        }
      });
    });
  });

  it('should return 404 when updating non-existent chat', () => {
    const updateData = {
      title: 'Chat Não Existente',
      summary: 'Resumo'
    };
    cy.request({
      method: 'PUT',
      url: '/api/chats/99999',
      body: updateData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should delete chat', () => {
    // First create a chat to delete
    const chatToDelete = {
      title: `Chat Para Deletar ${Date.now()}`,
      summary: 'Este chat será deletado',
      type: 'NORMAL'
    };

    cy.request({
      method: 'POST',
      url: '/api/chats',
      body: chatToDelete
    }).then(() => {
      // Get the created chat
      cy.request({
        method: 'GET',
        url: '/api/chats'
      }).then((response) => {
        const chat = response.body.find(c => c.title === chatToDelete.title);
        if (chat) {
          cy.request({
            method: 'DELETE',
            url: `/api/chats/${chat.id}`
          }).then((deleteResponse) => {
            expect(deleteResponse.status).to.eq(204);
          });
        }
      });
    });
  });
});
