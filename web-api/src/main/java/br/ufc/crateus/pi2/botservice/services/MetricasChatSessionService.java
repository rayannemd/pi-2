package br.ufc.crateus.pi2.botservice.services;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.dto.MetricasChatSession;
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
           .toInstant()
);

        Integer totalAtendimentos = chatRepository.countByCreateDateBetween(dataInicioDate, dataFimDate);

        Integer totalMensagensRecebidas = messageRepository.countByIssuerAndCreateDateBetween(EMessageIssuer.USER , dataInicioDate, dataFimDate);
        Integer totalMensagensEnviadas = messageRepository.countByIssuerAndCreateDateBetween(EMessageIssuer.AGENT , dataInicioDate, dataFimDate);

        MetricasChatSession metricas = new MetricasChatSession();

        metricas.setTotalAtendimentos(totalAtendimentos);

        metricas.setTotalMensagensEnviadas(totalMensagensEnviadas);
        metricas.setTotalMensagensRecebidas(totalMensagensRecebidas);


        return metricas;
    }
}
