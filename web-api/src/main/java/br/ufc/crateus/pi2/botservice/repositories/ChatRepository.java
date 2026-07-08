package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;

public interface ChatRepository extends JpaRepository<Chat, Long>
{
    public Integer countByCreateDateBetween(Date dataInicio , Date dataFim);

    List<Chat> findByChatStatusAndUpdateDateBefore(EChatStatus status, Date limite);

    public Integer countByChatRatingEqualsAndCreateDateBetween(Integer nota , Date dataInicio , Date dataFim);

    @Query("SELECT AVG(c.chatRating) FROM Chat c WHERE c.createDate >= :dataInicio AND c.createDate <= :dataFim")
    public Double getAverageChatRating(@Param("dataInicio") Date dataInicio , @Param("dataFim") Date dataFim);
}
