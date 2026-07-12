package br.ufc.crateus.pi2.botservice.services;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.dto.MetricasChatSession;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.MessageRepository;

@Service
public class MetricasChatSessionService {
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    public MetricasChatSessionService(ChatRepository chatRepository , MessageRepository messageRepository){
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    public MetricasChatSession filtrarPorData(LocalDate dataInicio , LocalDate dataFim){
        Date dataInicioDate = Date.from(dataInicio.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date dataFimDate = Date.from(dataFim.plusDays(1)
           .atStartOfDay(ZoneId.systemDefault())
           .toInstant());

        Integer totalAtendimentos = chatRepository.countByCreateDateBetween(dataInicioDate, dataFimDate);

        Integer totalMensagensRecebidas = messageRepository.countByIssuerAndCreateDateBetween(EMessageIssuer.USER , dataInicioDate, dataFimDate);
        Integer totalMensagensEnviadas = messageRepository.countByIssuerAndCreateDateBetween(EMessageIssuer.AGENT , dataInicioDate, dataFimDate);

        Integer totalPendentes = chatRepository.countByChatStatusEqualsAndCreateDateBetween(EChatStatus.PENDENTE, dataInicioDate, dataFimDate);

        Integer porcentagemSucesso = chatRepository.countByChatRatingGreaterThanEqualAndCreateDateBetween(3, dataInicioDate, dataFimDate);

        Integer totalChatsNota1 = chatRepository.countByChatRatingEqualsAndCreateDateBetween(1, dataInicioDate, dataFimDate);
        Integer totalChatsNota2 = chatRepository.countByChatRatingEqualsAndCreateDateBetween(2, dataInicioDate, dataFimDate);
        Integer totalChatsNota3 = chatRepository.countByChatRatingEqualsAndCreateDateBetween(3, dataInicioDate, dataFimDate);
        Integer totalChatsNota4 = chatRepository.countByChatRatingEqualsAndCreateDateBetween(4, dataInicioDate, dataFimDate);
        Integer totalChatsNota5 = chatRepository.countByChatRatingEqualsAndCreateDateBetween(5, dataInicioDate, dataFimDate);

        Double mediaNotasChat = chatRepository.getAverageChatRating(dataInicioDate, dataFimDate);

        MetricasChatSession metricas = new MetricasChatSession();

        metricas.setTotalAtendimentos(totalAtendimentos);

        metricas.setTotalMensagensEnviadas(totalMensagensEnviadas);
        metricas.setTotalMensagensRecebidas(totalMensagensRecebidas);

        metricas.setMediaAvaliacao(mediaNotasChat);

        metricas.setTotalPedentes(totalPendentes);

        metricas.setPorcentagemSucesso((totalAtendimentos > 0) ? ((double) porcentagemSucesso / totalAtendimentos) * 100 : 0.0);

        metricas.setTotalChatsNota1(totalChatsNota1);
        metricas.setTotalChatsNota2(totalChatsNota2);
        metricas.setTotalChatsNota3(totalChatsNota3);
        metricas.setTotalChatsNota4(totalChatsNota4);
        metricas.setTotalChatsNota5(totalChatsNota5);

        return metricas;
    }
}
