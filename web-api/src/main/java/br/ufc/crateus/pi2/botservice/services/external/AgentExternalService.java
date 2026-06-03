package br.ufc.crateus.pi2.botservice.services.external;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChatNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.MessageService;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentResponseDto;

@Service
public class AgentExternalService 
{
    private static final String BASE_URL = "http://agente:5000";

    @Autowired
    private WebClient webClient;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageService messageService;

    public AgentHandledResponseDto sendMessage(Long chatId, SendMessageCommand command)
    {
        var chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ChatNotFoundException());

        if(chat.getSummary() != null)
            command.setSummary(chat.getSummary());

        messageService.save(new ChatMessageDTO(command.getMessage(), EMessageIssuer.USER, chat));

        var response = webClient.post()
                        .uri(BASE_URL + "/prompt-agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(command)
                        .retrieve()
                        .bodyToMono(AgentResponseDto.class)
                        .block();

        if(chat.getTitle() == null || chat.getTitle().isBlank())
            chat.setTitle(response.getSummary());

        var handledResponse = handleResponseType(chat, response);

        chatRepository.save(chat);
        return handledResponse;
    }

    private AgentHandledResponseDto handleResponseType(Chat chat, AgentResponseDto response)
    {
        var type = String.valueOf(response.getClassification().get("type"));

        switch (type) 
        {
            case "chat":
                chat.setSummary(response.getSummary());
                messageService.save(new ChatMessageDTO(response.getAnswer(), EMessageIssuer.AGENT, chat));
                return AgentHandledResponseDto.chat(response);
            
            case "consulta_plano":
                var user = chat.getUser();
                var services = user.getServices();
                return AgentHandledResponseDto.payload(type, services);
                
            default:
                return null;
        }
    }
}
