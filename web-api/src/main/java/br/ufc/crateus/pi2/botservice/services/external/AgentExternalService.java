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
    private static final String BASE_URL = "http://agente:5000";

    @Autowired
    private WebClient webClient;

    @Autowired
    private ChatRepository chatRepository;

    //Função apenas para criar um objeto do chat para não acessar o BD(A função SendMessage original está abaixo)
    public AgentHandledResponseDto sendMessage(Long chatId, SendMessageCommand command)
    {
        // 1. Criar o objeto fake
        Chat fakeChat = new Chat();
        fakeChat.setId(1L);
        fakeChat.setSummary("Resumo fake");

        // 2. Chamar o agente
        var response = webClient.post()
                        .uri(BASE_URL + "/prompt-agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(command)
                        .retrieve()
                        .bodyToMono(AgentResponseDto.class)
                        .block();

        // 3. Usar o fakeChat para as atualizações
        if(fakeChat.getTitle() == null || fakeChat.getTitle().isBlank()) {
            fakeChat.setTitle(response.getSummary());
        }

        var handledResponse = handleResponseType(fakeChat, response);

        // Como o fakeChat não existe no banco, o JPA pode dar erro ao tentar salvar.
        // chatRepository.save(fakeChat); 

        return handledResponse;
    }

    /*public AgentHandledResponseDto sendMessage(Long chatId, SendMessageCommand command)
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
        if(chatToUpdate.getTitle() == null || chatToUpdate.getTitle().isBlank())
            chatToUpdate.setTitle(response.getSummary());

        var handledResponse = handleResponseType(chatToUpdate, response);

        chatRepository.save(chatToUpdate);
        return handledResponse;
    }*/


    private AgentHandledResponseDto handleResponseType(Chat chat, AgentResponseDto response)
    {
        // Força o tipo para 'chat' para evitar cair no 'consulta_plano' que exige banco de dados
        chat.setSummary(response.getSummary());
        return AgentHandledResponseDto.chat(response);
    }

    /*private AgentHandledResponseDto handleResponseType(Chat chat, AgentResponseDto response)
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
    }*/
}
