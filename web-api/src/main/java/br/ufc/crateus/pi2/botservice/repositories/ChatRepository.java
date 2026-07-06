package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;

public interface ChatRepository extends JpaRepository<Chat, Long>
{
    public Integer countByCreateDateBetween(Date dataInicio , Date dataFim);

    List<Chat> findByChatStatusAndUpdateDateBefore(EChatStatus status, Date limite);
}
