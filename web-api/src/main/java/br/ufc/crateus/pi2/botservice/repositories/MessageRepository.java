package br.ufc.crateus.pi2.botservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.Message;

public interface MessageRepository extends JpaRepository<Message, Long> 
{
    List<Message> findByChatId(Long chatId);
}