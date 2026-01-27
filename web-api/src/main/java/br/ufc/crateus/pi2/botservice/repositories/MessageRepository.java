//Repositorio utilizado pelo websocket

package br.ufc.crateus.pi2.botservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
