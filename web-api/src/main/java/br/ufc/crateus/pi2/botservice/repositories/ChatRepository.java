package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.ufc.crateus.pi2.botservice.models.Chat;

public interface ChatRepository extends JpaRepository<Chat, Long>  
{
    public Integer countByCreateDateBetween(Date dataInicio , Date dataFim);

    @Query("SELECT c FROM Chat c WHERE c.chatStatus = 'PENDENTE' " +
       "AND (SELECT MAX(m.createDate) FROM Message m WHERE m.chat = c AND m.messageIssuer = 'AGENT') < :limiteTempo")
    List<Chat> buscarChatsPendentesComUltimaMensagemDoAgenteApos(@Param("limiteTempo") Date limiteTempo);


    @Query("SELECT c FROM Chat c WHERE c.chatStatus = 'AVISADO'" + "AND (SELECT MAX(m.createDate) FROM Message m WHERE m.chat = c AND m.messageIssuer = 'AGENT') < :limiteTempo")
    List<Chat> buscarChatsAvisadosParaCancelar(@Param("limiteTempo") Date limiteTempo);
}
