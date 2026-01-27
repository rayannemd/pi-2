//Websocket para a comunicação no chat em tempo real entre o admin e o cliente caso o chatbot não responda da melhor forma

package br.ufc.crateus.pi2.botservice.controllers.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import br.ufc.crateus.pi2.botservice.dto.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.services.MessageService;

@Controller
public class ChatWebSocketController {

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessageDTO sendMessage(ChatMessageDTO message) {
        messageService.save(message);
        return message;
    }
}
