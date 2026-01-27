package br.ufc.crateus.pi2.botservice.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.dto.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.repositories.MessageRepository;

//Classe usada pelo websocket

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatService chatService;

    public Message save(ChatMessageDTO dto) {

        Chat chat = chatService.getById(dto.getChatId())
            .orElseThrow(() -> new RuntimeException("Chat não encontrado"));

        Message message = new Message();
        message.setContent(dto.getContent());
        message.setChat(chat);

        return messageRepository.save(message);
    }
}
