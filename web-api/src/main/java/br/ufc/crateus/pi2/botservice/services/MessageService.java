package br.ufc.crateus.pi2.botservice.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.MessageRepository;

@Service
public class MessageService
{
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRepository chatRepository;

    public List<Message> getMessagesByChatId(Long chatId)
    {
        return messageRepository.findByChatId(chatId);
    }

    public Message save(ChatMessageDTO dto)
    {
        Message message = new Message();
        message.setContent(dto.getContent());
        message.setChat(dto.getChat());
        message.setIssuer(dto.getIssuer());

        Message saved = messageRepository.save(message);

        // Mantém a última mensagem (e o updateDate) sincronizados no chat — ponto único
        // de escrita de mensagens, então a coluna nunca dessincroniza.
        Chat chat = dto.getChat();
        if (chat != null)
        {
            chat.setLastMessage(dto.getContent());
            chatRepository.save(chat);
        }

        return saved;
    }
}
