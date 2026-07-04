package br.ufc.crateus.pi2.botservice.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EChatType;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateChatCommand;

@Service
public class ChatService 
{
    @Autowired
    private final ChatRepository chatRepository;
    
    @Autowired
    private final UserRepository userRepository;

    public ChatService(
        ChatRepository chatRepository,
        UserRepository userRepository)
    {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    public List<Chat> getAll()
    {
        // lastMessage já vem persistido no chat (sincronizado em MessageService.save).
        return (List<Chat>) chatRepository.findAll();
    }

    public Optional<Chat> getById(Long id) 
    {
        return chatRepository.findById(id);
    }
    
    public Chat add(Long userId, CreateChatCommand command) 
    {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException());

        Chat newChat = command.toChat();
        newChat.setUser(user);

        chatRepository.save(newChat);
        return newChat;
    }

    public Chat update(Long id, UpdateChatCommand command) 
    {
        var existingChat = getById(id);

        if(existingChat.isEmpty())
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

    public void updateChatStatus(Long id, EChatStatus status){
       Chat chat = chatRepository.findById(id).orElseThrow(() -> new RuntimeException("Chat não encontrado."));
       chat.setChatStatus(status);
       chatRepository.save(chat);
    }

    public void processarMensagem(Long id, String message){
        Chat chat = chatRepository.findById(id).orElseThrow(() -> new RuntimeException("Chat não encontrado."));
        if(chat.getChatStatus() == EChatStatus.ESPERANDO_AVALIACAO){
            Integer nota = Integer.parseInt(message);
            
            if(message == null || message.isBlank()){
                chat.setChatRating(null);
            }else if(nota<1 || nota>5){
                throw new IllegalArgumentException("A nota deve ser um número entre 1 e 5");
            }

            chat.setChatRating(nota);
            chat.setChatStatus(EChatStatus.RESOLVIDO);

            chatRepository.save(chat);
        }
    }

    public void mudarParaEsperandoAvaliacao(Long id){
        Chat chat = chatRepository.findById(id).orElseThrow(() -> new RuntimeException("Chat não encontrado."));

        chat.setChatStatus(EChatStatus.ESPERANDO_AVALIACAO);
        chatRepository.save(chat);
    }
}
