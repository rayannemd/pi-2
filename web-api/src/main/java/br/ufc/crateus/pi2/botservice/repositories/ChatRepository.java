package br.ufc.crateus.pi2.botservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.Chat;

public interface ChatRepository extends JpaRepository<Chat, Long>  
{
    
}
