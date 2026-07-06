package br.ufc.crateus.pi2.botservice.controllers.websocket;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.ChatService;
import br.ufc.crateus.pi2.botservice.services.MessageService;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.external.AgentExternalService;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private AgentExternalService agentExternalService;

    @Autowired
    private ChatRepository chatRepository;

    @MessageMapping("/chat/{chatId}/send")
    public void enviarMensagem(@DestinationVariable Long chatId, ChatMessageDTO dto) {
        var chatOpt = chatService.getById(chatId);
        if (chatOpt.isEmpty())
            return;

        Chat chat = chatOpt.get();
        dto.setChat(chat);

        if (dto.getIssuer() == EMessageIssuer.USER) {

            // Atualiza a lista de chats
            chat.setUpdateDate(new Date());
            chatRepository.save(chat);
            messagingTemplate.convertAndSend("/topic/chats/atualizacao", chatId);

            // Mensagem normal - chama o agente
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, dto);

            SendMessageCommand command = new SendMessageCommand();
            command.setMessage(dto.getContent());

            AgentHandledResponseDto response = agentExternalService.sendMessage(chatId, command);

            // Atualiza a conversa após o agente responder
            chat.setUpdateDate(new Date());
            chatRepository.save(chat);
            messagingTemplate.convertAndSend("/topic/chats/atualizacao", chatId);

            if (response != null) {
                ChatMessageDTO respostaAgente = new ChatMessageDTO();
                respostaAgente.setContent(response.getChatResponse().getAnswer());
                respostaAgente.setIssuer(EMessageIssuer.AGENT);
                respostaAgente.setChat(chat);

                messagingTemplate.convertAndSend("/topic/chat/" + chatId, respostaAgente);
            }

        } else if (dto.getIssuer() == EMessageIssuer.AGENT) {
            // Mensagem do admin — salva diretamente sem chamar o agente
            messageService.save(dto);
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, dto);

            // Também atualiza a lista de chats quando o adm manda msg
            chat.setUpdateDate(new Date());
            chatRepository.save(chat);
            messagingTemplate.convertAndSend("/topic/chats/atualizacao", chatId);
        }
    }
}