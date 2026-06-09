package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;

public interface MessageRepository extends JpaRepository<Message, Long> 
{
    List<Message> findByChatId(Long chatId);

    Integer countByIssuerAndCreateDateBetween(EMessageIssuer issuer , Date dataInicio, Date dataFim);
}