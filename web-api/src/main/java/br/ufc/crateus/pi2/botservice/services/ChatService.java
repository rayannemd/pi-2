package br.ufc.crateus.pi2.botservice.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatType;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateChatCommand;

@Service
public class ChatService 
{
    @Autowired
    private final ChatRepository chatRepository;

    public ChatService(ChatRepository chatRepository) 
    {
        this.chatRepository = chatRepository;
    }

    public List<Chat> getAll() 
    {
        return (List<Chat>) chatRepository.findAll();
    }

    public Optional<Chat> getById(Long id) 
    {
        return chatRepository.findById(id);
    }
    
    public void add(CreateChatCommand command) 
    {
        Chat newChat = command.toChat();
        chatRepository.save(newChat);
    }

    public Chat update(Long id, UpdateChatCommand command) 
    {
        var existingChat = getById(id);

        if(existingChat == null) 
            return null;

        var chatToUpdate = existingChat.get();
        
        if(chatToUpdate.getTitle() == null)
            chatToUpdate.setTitle(command.getTitle());
        
        chatToUpdate.setSummary(command.getSummary());

        chatRepository.save(chatToUpdate);
        return chatToUpdate;
    }

    public void delete(Long id) 
    {
        var chat = getById(id);

        if(chat.isPresent()) 
        {
            chat.get().softDelete();
            chatRepository.save(chat.get());
        }
    }

    public void setChatPriority(Long id, EChatType priority) 
    {
        var chat = getById(id);

        if(chat.isPresent()) 
        {
            chat.get().setType(priority);
            chatRepository.save(chat.get());
        }
    }
}
