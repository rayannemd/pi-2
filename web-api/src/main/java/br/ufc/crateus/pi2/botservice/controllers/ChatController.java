package br.ufc.crateus.pi2.botservice.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.ChatService;
import br.ufc.crateus.pi2.botservice.services.MessageService;
import br.ufc.crateus.pi2.botservice.services.TokenService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateChatCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.external.AgentExternalService;

@RestController
@RequestMapping("api/chats")
public class ChatController 
{
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private AgentExternalService agentExternalService;
    
    @Autowired
    private MessageService messageService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Chat>> getAllChats()
    {
        return ResponseEntity.ok(
            chatService.getAll());
    }

    @PostMapping
    public ResponseEntity<Chat> createChat(
        @RequestHeader("Authorization") String authorization,
        @RequestBody CreateChatCommand command)
    {
        String token = authorization.replaceFirst("(?i)^Bearer\\s+", "");
        String email = tokenService.validateToken(token);

        var user = userRepository.findByEmail(email)
            .orElseThrow(UserNotFoundException::new);

        Chat chat = chatService.add(user.getId(), command);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chat> getChatById(@PathVariable Long id) 
    {
        var chat = chatService.getById(id);

        if(chat.isEmpty()) 
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(chat.get());
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Message>> getChatMessages(@PathVariable Long id) 
    {
        return ResponseEntity.ok(
            messageService.getMessagesByChatId(id));
    }
    
    @PostMapping("/{id}/messages")
    public ResponseEntity<AgentHandledResponseDto> sendMessageToAgent(@PathVariable Long id, @RequestBody SendMessageCommand command)
    {
        AgentHandledResponseDto response = agentExternalService.sendMessage(id, command);

        if(response == null)
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Chat> updateChat(@PathVariable Long id, @RequestBody UpdateChatCommand command) 
    {
        Chat updatedChat = chatService.update(id, command);

        if(updatedChat == null)
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(updatedChat);    
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Chat> deleteChat(@PathVariable Long id)
    {
        chatService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
