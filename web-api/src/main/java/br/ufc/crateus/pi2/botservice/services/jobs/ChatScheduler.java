package br.ufc.crateus.pi2.botservice.services.jobs;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.MessageService;

@Component
public class ChatScheduler {
    private final ChatRepository chatRepository;
    private final MessageService messageService;

    public ChatScheduler(ChatRepository chatRepository , MessageService messageService){
        this.chatRepository = chatRepository;
        this.messageService = messageService;
    }

    private Date calcHora(){
        Date atual = new Date();
        Calendar cal = Calendar.getInstance();

        cal.setTime(atual);
        cal.add(Calendar.HOUR_OF_DAY, -1);

        Date horaAtras = cal.getTime();
        return horaAtras;
    }


    @Scheduled(fixedRate = 60000)
    public void checkInactivity(){
        List<Chat> chats = chatRepository.buscarChatsPendentesComUltimaMensagemDoAgenteApos(calcHora());

        // aqui eu precisaria chamar a api do agente ou enviar uma mensagem padrão de inatividade(o que eu acredito ser mais difícil)
        for (Chat chat : chats) {
            ChatMessageDTO chatMessage = new ChatMessageDTO("Oie, ainda está aí? Estou disponível para resolver seu problema.", EMessageIssuer.AGENT, chat);
            chat.setChatStatus(EChatStatus.AVISADO);
            chatRepository.save(chat);
            messageService.save(chatMessage);
        }
    }

    @Scheduled(fixedRate = 60000)
    public void cancelChatByInactivity(){
        List<Chat> chats = chatRepository.buscarChatsAvisadosParaCancelar(calcHora());

        for (Chat chat : chats) {
            ChatMessageDTO chatMessage = new ChatMessageDTO("Nossa conversa está sendo cancelada por inatividade.", EMessageIssuer.AGENT, chat);
            chat.setChatStatus(EChatStatus.NAO_RESOLVIDO);
            chatRepository.save(chat);
            messageService.save(chatMessage);
        }
    }
}
