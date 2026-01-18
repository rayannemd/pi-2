package br.ufc.crateus.pi2.botservice.services.external;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentResponseDto;

@Service
public class AgentExternalService 
{
    private static final String BASE_URL = "http://agent-api:5000";

    @Autowired
    private WebClient webClient;

    @Autowired
    private ChatRepository chatRepository;

    public AgentHandledResponseDto sendMessage(Long chatId, SendMessageCommand command)
    {
        var chat = chatRepository.findById(chatId);

        if(chat.isEmpty())
            return null;
        else if(chat.get().getSummary() != null)
            command.setSummary(chat.get().getSummary());

        var response = webClient.post()
                        .uri(BASE_URL + "/prompt-agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(command)
                        .retrieve()
                        .bodyToMono(AgentResponseDto.class)
                        .block();

        
        var chatToUpdate = chat.get();
        if(chatToUpdate.getTitle() == null)
            chatToUpdate.setTitle(response.getSummary());

        var handledResponse = handleResponseType(chatToUpdate, response);

        chatRepository.save(chatToUpdate);
        return handledResponse;
    }

    private AgentHandledResponseDto handleResponseType(Chat chat, AgentResponseDto response)
    {
        var type = String.valueOf(response.getClassification().get("type"));

        switch (type) 
        {
            case "chat":
                chat.setSummary(response.getSummary());
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
